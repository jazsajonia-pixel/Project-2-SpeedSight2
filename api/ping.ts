import { Hono } from 'hono';
import { handle } from '@hono/vercel';

export const runtime = 'nodejs';

const pingApp = new Hono().basePath('/api');

pingApp.get('/ping', (c) => {
  return c.json({
    status: 'ok',
    service: 'speedsight-api',
  });
});

const handler = handle(pingApp);

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;

export default handler;
