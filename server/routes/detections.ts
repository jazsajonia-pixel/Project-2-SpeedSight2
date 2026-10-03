import { Hono } from 'hono';
import { DetectionEventType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { createDetectionSchema, detectionQuerySchema } from '../schemas/index.js';
import { AuthVariables } from '../middleware/auth.js';

export const detectionRoutes = new Hono<{ Variables: AuthVariables }>();

detectionRoutes.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const query = detectionQuerySchema.parse(c.req.query());

  const where: any = {
    session: { userId: user.id },
  };

  if (query.sessionId) where.sessionId = query.sessionId;
  if (query.classification) where.classification = query.classification;
  if (query.vehicleType) where.vehicleType = query.vehicleType;

  if (query.from || query.to) {
    where.detectedAt = {};
    if (query.from) where.detectedAt.gte = new Date(query.from);
    if (query.to) where.detectedAt.lte = new Date(query.to);
  }

  const detections = await prisma.vehicleDetection.findMany({
    where,
    take: query.limit,
    orderBy: { detectedAt: 'desc' },
    include: { session: true },
  });

  return c.json({ data: detections });
});

detectionRoutes.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const id = c.req.param('id');
  const detection = await prisma.vehicleDetection.findFirst({
    where: { id, session: { userId: user.id } },
    include: { session: true, events: true },
  });
  if (!detection) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Detection not found' } }, 404);
  }
  return c.json({ data: detection });
});

detectionRoutes.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createDetectionSchema.parse(body);

  const session = await prisma.monitoringSession.findFirst({
    where: { id: parsed.sessionId, userId: user.id },
  });

  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Monitoring session not found' } }, 404);
  }

  const detection = await prisma.vehicleDetection.create({
    data: {
      sessionId: parsed.sessionId,
      trackingId: parsed.trackingId,
      vehicleType: parsed.vehicleType,
      estimatedSpeed: parsed.estimatedSpeed,
      speedUnit: parsed.speedUnit,
      classification: parsed.classification,
      confidence: parsed.confidence,
      boundingBox: parsed.boundingBox,
      events: {
        create: {
          eventType: DetectionEventType.DETECTED,
        },
      },
    },
  });

  return c.json({ data: detection }, 201);
});
