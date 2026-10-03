import { z } from 'zod';

export const sessionStatusSchema = z.enum([
  'DRAFT',
  'READY',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
]);

export const sourceTypeSchema = z.enum(['CAMERA', 'VIDEO', 'DEMO']);

export const vehicleClassificationSchema = z.enum(['NORMAL', 'WARNING', 'SPEEDING']);

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  description: z.string().optional(),
  status: sessionStatusSchema.optional().default('DRAFT'),
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});

export const createCameraSchema = z.object({
  name: z.string().min(1, 'Camera name is required'),
  description: z.string().optional(),
  sourceType: sourceTypeSchema.optional().default('CAMERA'),
  processingQuality: z.string().optional().default('High'),
  resolution: z.string().optional().default('1920x1080'),
  frameRate: z.number().int().positive().optional().default(30),
});

export const updateCameraSchema = createCameraSchema.partial();

export const createCalibrationSchema = z.object({
  name: z.string().min(1, 'Profile name is required'),
  knownDistance: z.number().positive('Distance must be positive'),
  distanceUnit: z.string().optional().default('m'),
  calibrationData: z.any().optional(),
});

export const updateCalibrationSchema = createCalibrationSchema.partial();

export const createSpeedThresholdSchema = z
  .object({
    name: z.string().min(1, 'Threshold profile name is required'),
    normalMaximum: z.number().positive(),
    warningMaximum: z.number().positive(),
    unit: z.string().default('mph'),
  })
  .refine((data) => data.normalMaximum < data.warningMaximum, {
    message: 'normalMaximum must be strictly less than warningMaximum',
    path: ['normalMaximum'],
  });

export const updateSpeedThresholdSchema = z
  .object({
    name: z.string().optional(),
    normalMaximum: z.number().positive().optional(),
    warningMaximum: z.number().positive().optional(),
    unit: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.normalMaximum !== undefined && data.warningMaximum !== undefined) {
        return data.normalMaximum < data.warningMaximum;
      }
      return true;
    },
    {
      message: 'normalMaximum must be strictly less than warningMaximum',
      path: ['normalMaximum'],
    }
  );

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
