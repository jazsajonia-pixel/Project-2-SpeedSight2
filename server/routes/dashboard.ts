import { Hono } from 'hono';
import { VehicleClassification } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AuthVariables } from '../middleware/auth.js';

export const dashboardRoutes = new Hono<{ Variables: AuthVariables }>();

dashboardRoutes.get('/stats', async (c) => {
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
