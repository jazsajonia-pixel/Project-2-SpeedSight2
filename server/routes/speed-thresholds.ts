import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { createSpeedThresholdSchema, updateSpeedThresholdSchema } from '../schemas/index.js';
import { AuthVariables } from '../middleware/auth.js';

export const speedThresholdRoutes = new Hono<{ Variables: AuthVariables }>();

speedThresholdRoutes.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const thresholds = await prisma.speedThreshold.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: thresholds });
});

speedThresholdRoutes.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const threshold = await prisma.speedThreshold.findFirst({
    where: { id, userId: user.id },
  });
  if (!threshold) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Speed threshold profile not found' } }, 404);
  }
  return c.json({ data: threshold });
});

speedThresholdRoutes.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createSpeedThresholdSchema.parse(body);

  const threshold = await prisma.speedThreshold.create({
    data: { ...parsed, userId: user.id },
  });

  return c.json({ data: threshold }, 201);
});

speedThresholdRoutes.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateSpeedThresholdSchema.parse(body);

  const existing = await prisma.speedThreshold.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Speed threshold profile not found' } }, 404);
  }

  const normalMax = parsed.normalMaximum ?? existing.normalMaximum;
  const warningMax = parsed.warningMaximum ?? existing.warningMaximum;

  if (normalMax >= warningMax) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'normalMaximum must be strictly less than warningMaximum',
        },
      },
      400
    );
  }

  const threshold = await prisma.speedThreshold.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: threshold });
});

speedThresholdRoutes.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');

  const existing = await prisma.speedThreshold.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Speed threshold profile not found' } }, 404);
  }

  await prisma.speedThreshold.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});
