import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http';
import type { Hono } from 'hono';

type VercelRequestLike = IncomingMessage & {
  body?: unknown;
  rawBody?: Buffer | string;
};

type VercelResponseLike = ServerResponse;

type HonoApp = Hono<any>;

function headersFromNode(headers: IncomingHttpHeaders): Headers {
  const result = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    result.set(name, Array.isArray(value) ? value.join(', ') : value);
  }

  return result;
}

function getRequestUrl(req: VercelRequestLike): string {
  const protocolHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protocolHeader) ? protocolHeader[0] : protocolHeader ?? 'https';
  const hostHeader = req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader ?? 'localhost';
  const requestPath = req.url ?? '/';

  return `${protocol}://${host}${requestPath}`;
}

function getRequestBody(req: VercelRequestLike, headers: Headers): BodyInit | undefined {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  if (req.rawBody !== undefined) {
    return typeof req.rawBody === 'string' ? req.rawBody : new Uint8Array(req.rawBody);
  }

  if (req.body === undefined || req.body === null) return undefined;
  if (typeof req.body === 'string') return req.body;
  if (req.body instanceof Uint8Array) return new TextDecoder().decode(req.body);

  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  return JSON.stringify(req.body);
}

function toWebRequest(req: VercelRequestLike): Request {
  const headers = headersFromNode(req.headers);
  const body = getRequestBody(req, headers);

  return new Request(getRequestUrl(req), {
    method: req.method ?? 'GET',
    headers,
    body,
  });
}

function getSetCookieHeaders(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headersWithSetCookie.getSetCookie?.();
  if (cookies && cookies.length > 0) return cookies;

  const combined = headers.get('set-cookie');
  return combined ? [combined] : [];
}

async function writeWebResponse(response: Response, res: VercelResponseLike): Promise<void> {
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });

  const cookies = getSetCookieHeaders(response.headers);
  if (cookies.length > 0) res.setHeader('set-cookie', cookies);

  const body = response.status === 204 ? undefined : Buffer.from(await response.arrayBuffer());
  res.end(body);
}

export function createVercelHandler(app: HonoApp) {
  return async function vercelHandler(req: VercelRequestLike, res: VercelResponseLike): Promise<void> {
    const request = toWebRequest(req);
    const response = await app.fetch(request);
    await writeWebResponse(response, res);
  };
}
