import { PrismaClient, SourceType, SessionStatus, VehicleClassification, DetectionEventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo database...');

  // Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@speedsight.local' },
    update: {},
    create: {
      email: 'demo@speedsight.local',
      name: 'SpeedSight Demo Operator',
    },
  });

  // Create Camera Configuration
  const demoCamera = await prisma.cameraConfiguration.create({
    data: {
      userId: demoUser.id,
      name: 'Main St Traffic Pole #12',
      sourceType: SourceType.WEBCAM,
      resolution: '1920x1080',
      frameRate: 60,
    },
  });

  // Create Calibration Profile
  const demoCalibration = await prisma.calibrationProfile.create({
    data: {
      userId: demoUser.id,
      name: 'Main St Standard 50ft Calibration',
      distanceMeters: 15.24,
      pixelDistance: 450.0,
      calibrationMatrixJson: JSON.stringify({ scaleRatio: 12.4, angle: 15 }),
    },
  });

  // Create Speed Threshold
  const demoThreshold = await prisma.speedThreshold.create({
    data: {
      userId: demoUser.id,
      name: 'City Residential Standard (30 MPH)',
      speedLimit: 30.0,
      normalMaximum: 30.0,
      warningMaximum: 35.0,
      unit: 'mph',
    },
  });

  // Create Monitoring Session
  const demoSession = await prisma.monitoringSession.create({
    data: {
      userId: demoUser.id,
      name: 'Main St & 4th Ave Intersection',
      location: 'Northbound Traffic',
      sourceType: SourceType.WEBCAM,
      status: SessionStatus.ACTIVE,
    },
  });

  // Create Vehicle Detections
  const det1 = await prisma.vehicleDetection.create({
    data: {
      sessionId: demoSession.id,
      trackingId: 'VEH-8492',
      vehicleType: 'Sedan',
      estimatedSpeed: 42.0,
      speedUnit: 'mph',
      classification: VehicleClassification.SPEEDING,
      confidence: 0.94,
      boundingBox: { x: 120, y: 240, width: 80, height: 60 },
    },
  });

  await prisma.detectionEvent.create({
    data: {
      detectionId: det1.id,
      eventType: DetectionEventType.SPEEDING,
    },
  });

  const det2 = await prisma.vehicleDetection.create({
    data: {
      sessionId: demoSession.id,
      trackingId: 'VEH-8491',
      vehicleType: 'SUV',
      estimatedSpeed: 33.0,
      speedUnit: 'mph',
      classification: VehicleClassification.WARNING,
      confidence: 0.91,
      boundingBox: { x: 300, y: 180, width: 90, height: 70 },
    },
  });

  await prisma.detectionEvent.create({
    data: {
      detectionId: det2.id,
      eventType: DetectionEventType.SPEED_WARNING,
    },
  });

  // Create Traffic Summary
  await prisma.trafficSummary.create({
    data: {
      sessionId: demoSession.id,
      vehicleCount: 142,
      averageSpeed: 34.2,
      maximumSpeed: 54.0,
      speedingCount: 18,
      warningCount: 24,
      normalCount: 100,
    },
  });

  // Create Saved Report
  await prisma.savedReport.create({
    data: {
      sessionId: demoSession.id,
      name: 'Daily Speed Audit - Main St',
      reportType: 'SPEED_AUDIT',
    },
  });

  console.log('Database seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
