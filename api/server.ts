import { serve } from '@hono/node-server';
import { app } from './index.js';

const port = 3000;
console.log(`Starting Hono backend dev server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});
