-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('WEBCAM', 'IP_CAMERA', 'VIDEO_FILE', 'RTSP_STREAM');

-- CreateEnum
CREATE TYPE "VehicleClassification" AS ENUM ('NORMAL', 'WARNING', 'SPEEDING');

-- CreateEnum
CREATE TYPE "DetectionEventType" AS ENUM ('DETECTED', 'SPEED_WARNING', 'SPEEDING', 'SESSION_STARTED', 'SESSION_STOPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'WEBCAM',
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MonitoringSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CameraConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'WEBCAM',
    "sourceUrl" TEXT,
    "resolution" TEXT DEFAULT '1920x1080',
    "frameRate" INTEGER DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CameraConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "pixelDistance" DOUBLE PRECISION NOT NULL,
    "calibrationMatrixJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CalibrationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeedThreshold" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speedLimit" DOUBLE PRECISION NOT NULL,
    "normalMaximum" DOUBLE PRECISION NOT NULL,
    "warningMaximum" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'mph',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SpeedThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDetection" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'Car',
    "estimatedSpeed" DOUBLE PRECISION NOT NULL,
    "speedUnit" TEXT NOT NULL DEFAULT 'mph',
    "classification" "VehicleClassification" NOT NULL DEFAULT 'NORMAL',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION,
    "boundingBox" JSONB,
    "snapshotUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleDetection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetectionEvent" (
    "id" TEXT NOT NULL,
    "detectionId" TEXT NOT NULL,
    "eventType" "DetectionEventType" NOT NULL DEFAULT 'DETECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetectionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficSummary" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "vehicleCount" INTEGER NOT NULL DEFAULT 0,
    "averageSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maximumSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "speedingCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'SPEED_AUDIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_tokenHash_idx" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "MonitoringSession_userId_idx" ON "MonitoringSession"("userId");

-- CreateIndex
CREATE INDEX "CameraConfiguration_userId_idx" ON "CameraConfiguration"("userId");

-- CreateIndex
CREATE INDEX "CalibrationProfile_userId_idx" ON "CalibrationProfile"("userId");

-- CreateIndex
CREATE INDEX "SpeedThreshold_userId_idx" ON "SpeedThreshold"("userId");

-- CreateIndex
CREATE INDEX "VehicleDetection_sessionId_idx" ON "VehicleDetection"("sessionId");

-- CreateIndex
CREATE INDEX "VehicleDetection_trackingId_idx" ON "VehicleDetection"("trackingId");

-- CreateIndex
CREATE INDEX "VehicleDetection_detectedAt_idx" ON "VehicleDetection"("detectedAt");

-- CreateIndex
CREATE INDEX "DetectionEvent_detectionId_idx" ON "DetectionEvent"("detectionId");

-- CreateIndex
CREATE INDEX "TrafficSummary_sessionId_idx" ON "TrafficSummary"("sessionId");

-- CreateIndex
CREATE INDEX "SavedReport_sessionId_idx" ON "SavedReport"("sessionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringSession" ADD CONSTRAINT "MonitoringSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraConfiguration" ADD CONSTRAINT "CameraConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationProfile" ADD CONSTRAINT "CalibrationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeedThreshold" ADD CONSTRAINT "SpeedThreshold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDetection" ADD CONSTRAINT "VehicleDetection_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MonitoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectionEvent" ADD CONSTRAINT "DetectionEvent_detectionId_fkey" FOREIGN KEY ("detectionId") REFERENCES "VehicleDetection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficSummary" ADD CONSTRAINT "TrafficSummary_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MonitoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MonitoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

