import { Hono } from 'hono';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './lib/errors.js';
import { authMiddleware, AuthVariables } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { sessionRoutes } from './routes/sessions.js';
import { cameraRoutes } from './routes/cameras.js';
import { calibrationRoutes } from './routes/calibrations.js';
import { speedThresholdRoutes } from './routes/speed-thresholds.js';
import { detectionRoutes } from './routes/detections.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { reportRoutes } from './routes/reports.js';

export const app = new Hono<{ Variables: AuthVariables }>().basePath('/api');

app.onError(errorHandler);

// Diagnostic Endpoint (No Prisma / Neon / Auth dependencies)
app.get('/ping', (c) => {
  return c.json({
    status: 'ok',
    service: 'speedsight-api',
  });
});

// Public Health Check Endpoint
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

// Authentication Routes
app.route('/auth', authRoutes);

// Protected Routes Middleware & Mounts
app.use('/sessions/*', authMiddleware);
app.use('/sessions', authMiddleware);
app.route('/sessions', sessionRoutes);

app.use('/cameras/*', authMiddleware);
app.use('/cameras', authMiddleware);
app.route('/cameras', cameraRoutes);

app.use('/calibrations/*', authMiddleware);
app.use('/calibrations', authMiddleware);
app.route('/calibrations', calibrationRoutes);

app.use('/speed-thresholds/*', authMiddleware);
app.use('/speed-thresholds', authMiddleware);
app.route('/speed-thresholds', speedThresholdRoutes);

app.use('/detections/*', authMiddleware);
app.use('/detections', authMiddleware);
app.route('/detections', detectionRoutes);

app.use('/dashboard/stats', authMiddleware);
app.route('/dashboard', dashboardRoutes);

app.use('/reports/*', authMiddleware);
app.use('/reports', authMiddleware);
app.route('/reports', reportRoutes);
