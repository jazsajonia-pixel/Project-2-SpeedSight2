import { describe, expect, it } from 'vitest';
import { app } from '../index.js';
import { createVercelHandler } from '../vercel-adapter.js';

function createMockResponse() {
  const headers = new Map<string, string | string[]>();
  let body = Buffer.alloc(0);

  const response = {
    statusCode: 0,
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
      return response;
    },
    end(value?: string | Uint8Array) {
      body = value === undefined ? Buffer.alloc(0) : Buffer.from(value);
      return response;
    },
  };

  return {
    response,
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    getBody() {
      return body.toString('utf8');
    },
  };
}

describe('Vercel serverless adapter', () => {
  it('converts a Vercel-parsed JSON body into a Web Request body', async () => {
    const mock = createMockResponse();
    const handler = createVercelHandler(app);

    await handler(
      {
        method: 'POST',
        url: '/api/auth/register',
        headers: { host: 'localhost', 'content-type': 'application/json' },
        body: {},
      } as never,
      mock.response as never
    );

    expect(mock.response.statusCode).toBe(400);
    expect(JSON.parse(mock.getBody())).toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('provides standard Headers to cookie handling when no cookie is present', async () => {
    const mock = createMockResponse();
    const handler = createVercelHandler(app);

    await handler(
      {
        method: 'GET',
        url: '/api/auth/me',
        headers: { host: 'localhost' },
      } as never,
      mock.response as never
    );

    expect(mock.response.statusCode).toBe(401);
    expect(JSON.parse(mock.getBody())).toMatchObject({
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it('writes Hono response headers and body to the Vercel response', async () => {
    const mock = createMockResponse();
    const handler = createVercelHandler(app);

    await handler(
      {
        method: 'POST',
        url: '/api/auth/logout',
        headers: { host: 'localhost' },
      } as never,
      mock.response as never
    );

    expect(mock.response.statusCode).toBe(200);
    expect(mock.getHeader('set-cookie')).toEqual(expect.arrayContaining([expect.stringContaining('speedsight_session=')]));
    expect(JSON.parse(mock.getBody())).toEqual({ message: 'Logged out successfully' });
  });
});
