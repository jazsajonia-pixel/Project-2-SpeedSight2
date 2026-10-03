// Local development only. Vercel invokes api/index.ts directly in production.
import { serve } from '@hono/node-server';
import { app } from '../api';
serve({ fetch: app.fetch, port: 3001, hostname: '127.0.0.1' });
