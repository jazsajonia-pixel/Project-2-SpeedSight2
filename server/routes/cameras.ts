import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { createCameraSchema, updateCameraSchema } from '../schemas/index.js';
import { AuthVariables } from '../middleware/auth.js';

export const cameraRoutes = new Hono<{ Variables: AuthVariables }>();

cameraRoutes.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const cameras = await prisma.cameraConfiguration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: cameras });
});

cameraRoutes.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const camera = await prisma.cameraConfiguration.findFirst({
    where: { id, userId: user.id },
  });
  if (!camera) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Camera not found' } }, 404);
  }
  return c.json({ data: camera });
});

cameraRoutes.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createCameraSchema.parse(body);

  const camera = await prisma.cameraConfiguration.create({
    data: { ...parsed, userId: user.id },
  });

  return c.json({ data: camera }, 201);
});

cameraRoutes.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCameraSchema.parse(body);

  const existing = await prisma.cameraConfiguration.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Camera not found' } }, 404);
  }

  const camera = await prisma.cameraConfiguration.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: camera });
});

cameraRoutes.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');

  const existing = await prisma.cameraConfiguration.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Camera not found' } }, 404);
  }

  await prisma.cameraConfiguration.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});
