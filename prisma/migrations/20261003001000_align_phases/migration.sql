-- Preserve existing records while aligning Phase 3 fields and enums.
ALTER TABLE "MonitoringSession" RENAME COLUMN "location" TO "description";
ALTER TABLE "MonitoringSession" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "MonitoringSession" ALTER COLUMN "startedAt" DROP NOT NULL;
ALTER TABLE "MonitoringSession" ALTER COLUMN "startedAt" DROP DEFAULT;
-- Monitoring source belongs to CameraConfiguration in the specification.
ALTER TABLE "MonitoringSession" DROP COLUMN "sourceType";
ALTER TYPE "SourceType" RENAME TO "SourceType_old";
CREATE TYPE "SourceType" AS ENUM ('CAMERA', 'VIDEO', 'DEMO');
ALTER TABLE "CameraConfiguration" ALTER COLUMN "sourceType" DROP DEFAULT;
ALTER TABLE "CameraConfiguration" ALTER COLUMN "sourceType" TYPE "SourceType"
  USING (CASE WHEN "sourceType"::text = 'VIDEO_FILE' THEN 'VIDEO' ELSE 'CAMERA' END)::"SourceType";
ALTER TABLE "CameraConfiguration" ALTER COLUMN "sourceType" SET DEFAULT 'CAMERA';
DROP TYPE "SourceType_old";
-- Retain legacy source text as descriptive metadata; it is never opened or fetched.
ALTER TABLE "CameraConfiguration" RENAME COLUMN "sourceUrl" TO "description";
ALTER TABLE "CameraConfiguration" ADD COLUMN "processingQuality" TEXT NOT NULL DEFAULT 'High';
ALTER TABLE "CalibrationProfile" RENAME COLUMN "distanceMeters" TO "knownDistance";
ALTER TABLE "CalibrationProfile" ADD COLUMN "distanceUnit" TEXT NOT NULL DEFAULT 'm';
ALTER TABLE "CalibrationProfile" ADD COLUMN "calibrationData" JSONB;
UPDATE "CalibrationProfile" SET "calibrationData" = jsonb_build_object(
  'legacyPixelDistance', "pixelDistance", 'legacyCalibrationMatrixJson', "calibrationMatrixJson"
);
ALTER TABLE "CalibrationProfile" DROP COLUMN "pixelDistance", DROP COLUMN "calibrationMatrixJson";
-- Classification uses normalMaximum/warningMaximum; the redundant speedLimit is retired.
ALTER TABLE "SpeedThreshold" DROP COLUMN "speedLimit";
-- Fail rather than silently change existing invalid thresholds. Repair these before retrying.
ALTER TABLE "SpeedThreshold" ADD CONSTRAINT "SpeedThreshold_order_check"
  CHECK ("normalMaximum" < "warningMaximum");
