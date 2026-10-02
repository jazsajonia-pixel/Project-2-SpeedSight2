import { z } from 'zod';

export const sessionStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']);
export const sourceTypeSchema = z.enum(['WEBCAM', 'IP_CAMERA', 'VIDEO_FILE', 'RTSP_STREAM']);
export const vehicleClassificationSchema = z.enum(['NORMAL', 'WARNING', 'SPEEDING']);

export const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  location: z.string().optional(),
  sourceType: sourceTypeSchema.optional(),
  userId: z.string().optional(),
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  status: sessionStatusSchema.optional(),
  endedAt: z.string().datetime().optional(),
});

export const createCameraSchema = z.object({
  name: z.string().min(1, 'Camera name is required'),
  sourceType: sourceTypeSchema.optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  resolution: z.string().optional(),
  frameRate: z.number().int().positive().optional(),
  userId: z.string().optional(),
});

export const updateCameraSchema = createCameraSchema.partial();

export const createCalibrationSchema = z.object({
  name: z.string().min(1, 'Profile name is required'),
  distanceMeters: z.number().positive('Distance must be positive'),
  pixelDistance: z.number().positive('Pixel distance must be positive'),
  calibrationMatrixJson: z.string().optional(),
  userId: z.string().optional(),
});

export const updateCalibrationSchema = createCalibrationSchema.partial();

export const createSpeedThresholdSchema = z
  .object({
    name: z.string().min(1, 'Threshold profile name is required'),
    speedLimit: z.number().positive(),
    normalMaximum: z.number().positive(),
    warningMaximum: z.number().positive(),
    unit: z.string().default('mph'),
    userId: z.string().optional(),
  })
  .refine((data) => data.normalMaximum < data.warningMaximum, {
    message: 'normalMaximum must be strictly less than warningMaximum',
    path: ['normalMaximum'],
  });

export const updateSpeedThresholdSchema = z.object({
  name: z.string().optional(),
  speedLimit: z.number().positive().optional(),
  normalMaximum: z.number().positive().optional(),
  warningMaximum: z.number().positive().optional(),
  unit: z.string().optional(),
  userId: z.string().optional(),
});

export const detectionQuerySchema = z.object({
  sessionId: z.string().optional(),
  classification: vehicleClassificationSchema.optional(),
  vehicleType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).optional().default(50),
});

export const createReportSchema = z.object({
  name: z.string().min(1, 'Report title is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  reportType: z.string().optional().default('SPEED_AUDIT'),
});
