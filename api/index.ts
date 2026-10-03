import { Hono } from 'hono';
import { handle } from '@hono/vercel';
import { VehicleClassification, User, DetectionEventType } from '@prisma/client';
import { prisma } from './utils/prisma';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionCookie,
  SESSION_EXPIRATION_DAYS,
} from './utils/auth';
import {
  registerSchema,
  loginSchema,
  createSessionSchema,
  updateSessionSchema,
  createCameraSchema,
  updateCameraSchema,
  createCalibrationSchema,
  updateCalibrationSchema,
  createSpeedThresholdSchema,
  updateSpeedThresholdSchema,
  createDetectionSchema,
  detectionQuerySchema,
  createReportSchema,
} from './schemas';

type Variables = {
  authenticatedUser: User;
  sessionId: string;
};

export const app = new Hono<{ Variables: Variables }>().basePath('/api');

app.onError(errorHandler);

// ----------------------------------------------------
// Health Endpoint (Public)
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
// Authentication Endpoints
// ----------------------------------------------------
app.post('/auth/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.parse(body);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) {
    return c.json(
      { error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email address already exists' } },
      400
    );
  }

  const passwordHash = await hashPassword(parsed.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
    },
  });

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  setSessionCookie(c, token);

  return c.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    201
  );
});

app.post('/auth/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (!user) {
    return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Unable to sign in. Please check your email and password.' } }, 401);
  }

  const valid = await verifyPassword(parsed.password, user.passwordHash);
  if (!valid) {
    return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Unable to sign in. Please check your email and password.' } }, 401);
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  setSessionCookie(c, token);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.post('/auth/logout', async (c) => {
  const token = getSessionCookie(c);
  if (token) {
    const tokenHash = hashSessionToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  clearSessionCookie(c);
  return c.json({ message: 'Logged out successfully' });
});

app.get('/auth/me', async (c) => {
  const token = getSessionCookie(c);
  if (!token) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, 401);
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    clearSessionCookie(c);
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Session expired' } }, 401);
  }

  return c.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
  });
});

// ----------------------------------------------------
// Protected API Routes Middleware
// ----------------------------------------------------
app.use('/sessions/*', authMiddleware);
app.use('/sessions', authMiddleware);
app.use('/cameras/*', authMiddleware);
app.use('/cameras', authMiddleware);
app.use('/calibrations/*', authMiddleware);
app.use('/calibrations', authMiddleware);
app.use('/speed-thresholds/*', authMiddleware);
app.use('/speed-thresholds', authMiddleware);
app.use('/detections/*', authMiddleware);
app.use('/detections', authMiddleware);
app.use('/dashboard/stats', authMiddleware);
app.use('/reports/*', authMiddleware);
app.use('/reports', authMiddleware);

// ----------------------------------------------------
// Monitoring Sessions CRUD
// ----------------------------------------------------
app.get('/sessions', async (c) => {
  const user = c.get('authenticatedUser');
  const sessions = await prisma.monitoringSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: sessions });
});

app.get('/sessions/:id', async (c) => {
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

app.post('/sessions', async (c) => {
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

app.patch('/sessions/:id', async (c) => {
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

app.delete('/sessions/:id', async (c) => {
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

// ----------------------------------------------------
// Camera Configurations CRUD
// ----------------------------------------------------
app.get('/cameras', async (c) => {
  const user = c.get('authenticatedUser');
  const cameras = await prisma.cameraConfiguration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: cameras });
});

app.get('/cameras/:id', async (c) => {
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

app.post('/cameras', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createCameraSchema.parse(body);

  const camera = await prisma.cameraConfiguration.create({
    data: { ...parsed, userId: user.id },
  });

  return c.json({ data: camera }, 201);
});

app.patch('/cameras/:id', async (c) => {
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

app.delete('/cameras/:id', async (c) => {
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

// ----------------------------------------------------
// Calibration Profiles CRUD
// ----------------------------------------------------
app.get('/calibrations', async (c) => {
  const user = c.get('authenticatedUser');
  const calibrations = await prisma.calibrationProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: calibrations });
});

app.get('/calibrations/:id', async (c) => {
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

app.post('/calibrations', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createCalibrationSchema.parse(body);

  const calibration = await prisma.calibrationProfile.create({
    data: { ...parsed, userId: user.id },
  });

  return c.json({ data: calibration }, 201);
});

app.patch('/calibrations/:id', async (c) => {
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

app.delete('/calibrations/:id', async (c) => {
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

// ----------------------------------------------------
// Speed Thresholds CRUD
// ----------------------------------------------------
app.get('/speed-thresholds', async (c) => {
  const user = c.get('authenticatedUser');
  const thresholds = await prisma.speedThreshold.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: thresholds });
});

app.get('/speed-thresholds/:id', async (c) => {
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

app.post('/speed-thresholds', async (c) => {
  const user = c.get('authenticatedUser');
  const body = await c.req.json();
  const parsed = createSpeedThresholdSchema.parse(body);

  const threshold = await prisma.speedThreshold.create({
    data: { ...parsed, userId: user.id },
  });

  return c.json({ data: threshold }, 201);
});

app.patch('/speed-thresholds/:id', async (c) => {
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

app.delete('/speed-thresholds/:id', async (c) => {
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

// ----------------------------------------------------
// Vehicle Detections API (with Date Range Filtering & Persistence)
// ----------------------------------------------------
app.get('/detections', async (c) => {
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

app.get('/detections/:id', async (c) => {
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

app.post('/detections', async (c) => {
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

// ----------------------------------------------------
// Dashboard Statistics API
// ----------------------------------------------------
app.get('/dashboard/stats', async (c) => {
  const user = c.get('authenticatedUser');

  const vehiclesDetected = await prisma.vehicleDetection.count({
    where: { session: { userId: user.id } },
  });
  const activeSessions = await prisma.monitoringSession.count({
    where: { userId: user.id, status: 'ACTIVE' },
  });
  const speedingEvents = await prisma.vehicleDetection.count({
    where: { session: { userId: user.id }, classification: VehicleClassification.SPEEDING },
  });

  const speedAggr = await prisma.vehicleDetection.aggregate({
    where: { session: { userId: user.id } },
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
  const user = c.get('authenticatedUser');
  const reports = await prisma.savedReport.findMany({
    where: { session: { userId: user.id } },
    orderBy: { createdAt: 'desc' },
    include: { session: true },
  });
  return c.json({ data: reports });
});

app.get('/reports/:id', async (c) => {
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

app.post('/reports', async (c) => {
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

app.delete('/reports/:id', async (c) => {
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

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);

export default handle(app);
