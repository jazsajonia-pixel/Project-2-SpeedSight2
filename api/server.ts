import { serve } from '@hono/node-server';
import { app } from '../server/app.js';

const port = 3000;
console.log(`Starting Hono backend dev server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});
