import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { createCalibrationSchema, updateCalibrationSchema } from '../schemas/index.js';
import { AuthVariables } from '../middleware/auth.js';

export const calibrationRoutes = new Hono<{ Variables: AuthVariables }>();

calibrationRoutes.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const calibrations = await prisma.calibrationProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: calibrations });
});

calibrationRoutes.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const calibration = await prisma.calibrationProfile.findFirst({
    where: { id, userId: user.id },
  });
  if (!calibration) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Calibration profile not found' } }, 404);
  }
  return c.json({ data: calibration });
});

calibrationRoutes.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createCalibrationSchema.parse(body);

  const calibration = await prisma.calibrationProfile.create({
    data: { ...parsed, userId: user.id },
  });

  return c.json({ data: calibration }, 201);
});

calibrationRoutes.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCalibrationSchema.parse(body);

  const existing = await prisma.calibrationProfile.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Calibration profile not found' } }, 404);
  }

  const calibration = await prisma.calibrationProfile.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: calibration });
});

calibrationRoutes.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');

  const existing = await prisma.calibrationProfile.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Calibration profile not found' } }, 404);
  }

  await prisma.calibrationProfile.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});
