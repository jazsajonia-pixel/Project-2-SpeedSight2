import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { createSessionSchema, updateSessionSchema } from '../schemas/index.js';
import { AuthVariables } from '../middleware/auth.js';

export const sessionRoutes = new Hono<{ Variables: AuthVariables }>();

sessionRoutes.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const sessions = await prisma.monitoringSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: sessions });
});

sessionRoutes.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const session = await prisma.monitoringSession.findFirst({
    where: { id, userId: user.id },
    include: { trafficSummaries: true, vehicleDetections: { take: 20 } },
  });
  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }
  return c.json({ data: session });
});

sessionRoutes.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createSessionSchema.parse(body);

  const session = await prisma.monitoringSession.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      status: parsed.status,
      userId: user.id,
    },
  });

  return c.json({ data: session }, 201);
});

sessionRoutes.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateSessionSchema.parse(body);

  const existing = await prisma.monitoringSession.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }

  const session = await prisma.monitoringSession.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: session });
});

sessionRoutes.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');

  const existing = await prisma.monitoringSession.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }

  await prisma.monitoringSession.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});
