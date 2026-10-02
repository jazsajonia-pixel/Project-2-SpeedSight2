import { Hono } from 'hono';
import { PrismaClient, VehicleClassification } from '@prisma/client';
import { errorHandler } from './middleware/error';
import {
  createSessionSchema,
  updateSessionSchema,
  createCameraSchema,
  updateCameraSchema,
  createCalibrationSchema,
  updateCalibrationSchema,
  createSpeedThresholdSchema,
  updateSpeedThresholdSchema,
  detectionQuerySchema,
  createReportSchema,
} from './schemas';

const prisma = new PrismaClient();
const app = new Hono().basePath('/api');

app.onError(errorHandler);

// Helper to get fallback demo userId if unauthenticated
async function getDemoUserId() {
  const user = await prisma.user.findFirst({
    where: { email: 'demo@speedsight.local' },
  });
  if (user) return user.id;
  const newUser = await prisma.user.create({
    data: { email: 'demo@speedsight.local', name: 'Demo User' },
  });
  return newUser.id;
}

// ----------------------------------------------------
// Health Endpoint
// ----------------------------------------------------
app.get('/health', async (c) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unavailable (dev environment mode)';
  }

  return c.json({
    status: 'ok',
    service: 'speedsight-api',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// Monitoring Sessions API
// ----------------------------------------------------
app.get('/sessions', async (c) => {
  const sessions = await prisma.monitoringSession.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: sessions });
});

app.get('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const session = await prisma.monitoringSession.findUnique({
    where: { id },
    include: { trafficSummaries: true, vehicleDetections: { take: 20 } },
  });
  if (!session) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404);
  }
  return c.json({ data: session });
});

app.post('/sessions', async (c) => {
  const body = await c.req.json();
  const parsed = createSessionSchema.parse(body);
  const userId = parsed.userId || (await getDemoUserId());

  const session = await prisma.monitoringSession.create({
    data: {
      name: parsed.name,
      location: parsed.location,
      sourceType: parsed.sourceType,
      userId,
    },
  });

  return c.json({ data: session }, 201);
});

app.patch('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateSessionSchema.parse(body);

  const session = await prisma.monitoringSession.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: session });
});

app.delete('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  await prisma.monitoringSession.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});

// ----------------------------------------------------
// Camera Configurations API
// ----------------------------------------------------
app.get('/cameras', async (c) => {
  const cameras = await prisma.cameraConfiguration.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: cameras });
});

app.get('/cameras/:id', async (c) => {
  const id = c.req.param('id');
  const camera = await prisma.cameraConfiguration.findUnique({ where: { id } });
  if (!camera) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Camera not found' } }, 404);
  }
  return c.json({ data: camera });
});

app.post('/cameras', async (c) => {
  const body = await c.req.json();
  const parsed = createCameraSchema.parse(body);
  const userId = parsed.userId || (await getDemoUserId());

  const camera = await prisma.cameraConfiguration.create({
    data: { ...parsed, userId },
  });

  return c.json({ data: camera }, 201);
});

app.patch('/cameras/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCameraSchema.parse(body);

  const camera = await prisma.cameraConfiguration.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: camera });
});

app.delete('/cameras/:id', async (c) => {
  const id = c.req.param('id');
  await prisma.cameraConfiguration.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});

// ----------------------------------------------------
// Calibration Profiles API
// ----------------------------------------------------
app.get('/calibrations', async (c) => {
  const calibrations = await prisma.calibrationProfile.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: calibrations });
});

app.get('/calibrations/:id', async (c) => {
  const id = c.req.param('id');
  const calibration = await prisma.calibrationProfile.findUnique({ where: { id } });
  if (!calibration) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Calibration profile not found' } }, 404);
  }
  return c.json({ data: calibration });
});

app.post('/calibrations', async (c) => {
  const body = await c.req.json();
  const parsed = createCalibrationSchema.parse(body);
  const userId = parsed.userId || (await getDemoUserId());

  const calibration = await prisma.calibrationProfile.create({
    data: { ...parsed, userId },
  });

  return c.json({ data: calibration }, 201);
});

app.patch('/calibrations/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCalibrationSchema.parse(body);

  const calibration = await prisma.calibrationProfile.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: calibration });
});

app.delete('/calibrations/:id', async (c) => {
  const id = c.req.param('id');
  await prisma.calibrationProfile.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});

// ----------------------------------------------------
// Speed Thresholds API
// ----------------------------------------------------
app.get('/speed-thresholds', async (c) => {
  const thresholds = await prisma.speedThreshold.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: thresholds });
});

app.get('/speed-thresholds/:id', async (c) => {
  const id = c.req.param('id');
  const threshold = await prisma.speedThreshold.findUnique({ where: { id } });
  if (!threshold) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Speed threshold profile not found' } }, 404);
  }
  return c.json({ data: threshold });
});

app.post('/speed-thresholds', async (c) => {
  const body = await c.req.json();
  const parsed = createSpeedThresholdSchema.parse(body);
  const userId = parsed.userId || (await getDemoUserId());

  const threshold = await prisma.speedThreshold.create({
    data: { ...parsed, userId },
  });

  return c.json({ data: threshold }, 201);
});

app.patch('/speed-thresholds/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateSpeedThresholdSchema.parse(body);

  if (parsed.normalMaximum !== undefined && parsed.warningMaximum !== undefined) {
    if (parsed.normalMaximum >= parsed.warningMaximum) {
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
  }

  const threshold = await prisma.speedThreshold.update({
    where: { id },
    data: parsed,
  });

  return c.json({ data: threshold });
});

app.delete('/speed-thresholds/:id', async (c) => {
  const id = c.req.param('id');
  await prisma.speedThreshold.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});

// ----------------------------------------------------
// Vehicle Detections API
// ----------------------------------------------------
app.get('/detections', async (c) => {
  const query = detectionQuerySchema.parse(c.req.query());

  const where: any = {};
  if (query.sessionId) where.sessionId = query.sessionId;
  if (query.classification) where.classification = query.classification;
  if (query.vehicleType) where.vehicleType = query.vehicleType;

  const detections = await prisma.vehicleDetection.findMany({
    where,
    take: query.limit,
    orderBy: { detectedAt: 'desc' },
    include: { session: true },
  });

  return c.json({ data: detections });
});

app.get('/detections/:id', async (c) => {
  const id = c.req.param('id');
  const detection = await prisma.vehicleDetection.findUnique({
    where: { id },
    include: { session: true, events: true },
  });
  if (!detection) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Detection not found' } }, 404);
  }
  return c.json({ data: detection });
});

// ----------------------------------------------------
// Dashboard Statistics API
// ----------------------------------------------------
app.get('/dashboard/stats', async (c) => {
  const vehiclesDetected = await prisma.vehicleDetection.count();
  const activeSessions = await prisma.monitoringSession.count({
    where: { status: 'ACTIVE' },
  });
  const speedingEvents = await prisma.vehicleDetection.count({
    where: { classification: VehicleClassification.SPEEDING },
  });

  const speedAggr = await prisma.vehicleDetection.aggregate({
    _avg: { estimatedSpeed: true },
    _max: { estimatedSpeed: true },
  });

  return c.json({
    data: {
      vehiclesDetected,
      averageSpeed: Math.round((speedAggr._avg.estimatedSpeed || 0) * 10) / 10,
      maximumSpeed: speedAggr._max.estimatedSpeed || 0,
      speedingEvents,
      activeSessions,
    },
  });
});

// ----------------------------------------------------
// Saved Reports API
// ----------------------------------------------------
app.get('/reports', async (c) => {
  const reports = await prisma.savedReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: { session: true },
  });
  return c.json({ data: reports });
});

app.get('/reports/:id', async (c) => {
  const id = c.req.param('id');
  const report = await prisma.savedReport.findUnique({
    where: { id },
    include: { session: true },
  });
  if (!report) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Report not found' } }, 404);
  }
  return c.json({ data: report });
});

app.post('/reports', async (c) => {
  const body = await c.req.json();
  const parsed = createReportSchema.parse(body);

  const report = await prisma.savedReport.create({
    data: parsed,
  });

  return c.json({ data: report }, 201);
});

app.delete('/reports/:id', async (c) => {
  const id = c.req.param('id');
  await prisma.savedReport.delete({ where: { id } });
  return c.json({ data: { id, deleted: true } });
});

export default app;
