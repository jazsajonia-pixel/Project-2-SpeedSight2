import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { createReportSchema } from '../schemas/index.js';
import { AuthVariables } from '../middleware/auth.js';

export const reportRoutes = new Hono<{ Variables: AuthVariables }>();

reportRoutes.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const reports = await prisma.savedReport.findMany({
    where: { session: { userId: user.id } },
    orderBy: { createdAt: 'desc' },
    include: { session: true },
  });
  return c.json({ data: reports });
});

reportRoutes.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const report = await prisma.savedReport.findFirst({
    where: { id, session: { userId: user.id } },
    include: { session: true },
  });
  if (!report) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Report not found' } }, 404);
  }
  return c.json({ data: report });
});

reportRoutes.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createReportSchema.parse(body);

  const session = await prisma.monitoringSession.findFirst({
    where: { id: parsed.sessionId, userId: user.id },
  });
  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Target monitoring session not found' } }, 404);
  }

  const report = await prisma.savedReport.create({
    data: parsed,
  });

  return c.json({ data: report }, 201);
});

reportRoutes.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');

  const existing = await prisma.savedReport.findFirst({
    where: { id, session: { userId: user.id } },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Report not found' } }, 404);
  }

  await prisma.savedReport.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});
