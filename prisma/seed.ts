import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../api/utils/auth';

const prisma = new PrismaClient();
// Public, development-only fixture credentials. Never seed a production database.
async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production');
  const passwordHash = await hashPassword('Demo12345!');
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: 'demo@speedsight.local' },
      update: {},
      create: { id: '00000000-0000-4000-8000-000000000001', email: 'demo@speedsight.local', name: 'Demo Operator (sample data)', passwordHash },
    });
    const session = await tx.monitoringSession.upsert({
      where: { id: '00000000-0000-4000-8000-000000000002' },
      update: {},
      create: { id: '00000000-0000-4000-8000-000000000002', userId: user.id,
        name: 'Demo — Main Street', description: 'Synthetic development fixtures, not camera measurements.',
        status: 'COMPLETED', startedAt: new Date('2026-01-01T10:00:00Z'), endedAt: new Date('2026-01-01T11:00:00Z') },
    });
    await tx.cameraConfiguration.upsert({
      where: { id: '00000000-0000-4000-8000-000000000003' }, update: {},
      create: { id: '00000000-0000-4000-8000-000000000003', userId: user.id, name: 'Demo camera configuration',
        description: 'No physical camera', sourceType: 'DEMO', resolution: '1920x1080', frameRate: 30, processingQuality: 'High' },
    });
    await tx.calibrationProfile.upsert({
      where: { id: '00000000-0000-4000-8000-000000000004' }, update: {},
      create: { id: '00000000-0000-4000-8000-000000000004', userId: user.id, name: 'Demo distance configuration',
        knownDistance: 50, distanceUnit: 'ft', calibrationData: { demo: true } },
    });
    await tx.speedThreshold.upsert({
      where: { id: '00000000-0000-4000-8000-000000000005' }, update: {},
      create: { id: '00000000-0000-4000-8000-000000000005', userId: user.id, name: 'Demo residential thresholds',
        normalMaximum: 30, warningMaximum: 35, unit: 'mph' },
    });
    for (const [index, speed, classification] of [[6, 42, 'SPEEDING'], [7, 33, 'WARNING']] as const) {
      const id = `00000000-0000-4000-8000-00000000000${index}`;
      await tx.vehicleDetection.upsert({ where: { id }, update: {}, create: {
        id, sessionId: session.id, trackingId: `DEMO-${index}`, vehicleType: 'Car', estimatedSpeed: speed,
        speedUnit: 'mph', classification, detectedAt: new Date(`2026-01-01T10:0${index}:00Z`),
        // No fabricated confidence, image or bounding box.
      } });
      const eventId = `00000000-0000-4000-8000-00000000001${index}`;
      await tx.detectionEvent.upsert({ where: { id: eventId }, update: {}, create: {
        id: eventId, detectionId: id, eventType: classification === 'SPEEDING' ? 'SPEEDING' : 'SPEED_WARNING',
      } });
    }
    await tx.trafficSummary.upsert({
      where: { id: '00000000-0000-4000-8000-000000000008' }, update: {},
      create: { id: '00000000-0000-4000-8000-000000000008', sessionId: session.id,
        vehicleCount: 2, averageSpeed: 37.5, maximumSpeed: 42, speedingCount: 1, warningCount: 1, normalCount: 0 },
    });
    await tx.savedReport.upsert({
      where: { id: '00000000-0000-4000-8000-000000000009' }, update: {},
      create: { id: '00000000-0000-4000-8000-000000000009', sessionId: session.id, name: 'Demo report metadata', reportType: 'SPEED_AUDIT' },
    });
  });
  console.log('Development demo fixtures ready (not real detections).');
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
