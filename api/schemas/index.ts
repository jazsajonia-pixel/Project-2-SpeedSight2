import { z } from 'zod';
import { SessionStatus, SourceType, VehicleClassification } from '@prisma/client';

export const sessionStatusSchema = z.nativeEnum(SessionStatus);
export const sourceTypeSchema = z.nativeEnum(SourceType);
export const vehicleClassificationSchema = z.nativeEnum(VehicleClassification);
export const idSchema = z.string().uuid();
const name = z.string().trim().min(1).max(200);
const description = z.string().trim().max(2000);
const email = z.string().trim().email('Invalid email address').max(254).toLowerCase();
// bcrypt only processes the first 72 bytes; reject silently truncated passwords.
const password = z.string().min(1, 'Password is required').refine(
  (value) => new TextEncoder().encode(value).length <= 72,
  'Password must be at most 72 UTF-8 bytes',
);
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').pipe(password),
});
export const loginSchema = z.object({ email, password });

const dateTime = z.string().datetime({ offset: true });
export const createSessionSchema = z.object({ name, description: description.optional() });
export const updateSessionSchema = createSessionSchema.partial().extend({
  status: sessionStatusSchema.optional(),
  startedAt: dateTime.nullable().optional(),
  endedAt: dateTime.nullable().optional(),
});
export const createCameraSchema = z.object({
  name,
  description: description.optional(),
  sourceType: sourceTypeSchema.optional(),
  resolution: z.string().regex(/^\d{2,5}x\d{2,5}$/).optional(),
  frameRate: z.number().int().positive().max(240).optional(),
  processingQuality: z.enum(['Low', 'Medium', 'High', 'Ultra']).optional(),
});
export const updateCameraSchema = createCameraSchema.partial();

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
const jsonValue: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.string(), z.number().finite(), z.boolean(), z.null(), z.array(jsonValue), z.record(jsonValue),
]));
export const createCalibrationSchema = z.object({
  name,
  knownDistance: z.number().finite().positive(),
  distanceUnit: z.enum(['m', 'ft']).default('m'),
  calibrationData: z.record(jsonValue).optional(),
});
export const updateCalibrationSchema = createCalibrationSchema.partial();

const thresholdFields = z.object({
  name,
  normalMaximum: z.number().finite().nonnegative(),
  warningMaximum: z.number().finite().positive(),
  unit: z.enum(['mph', 'km/h']).default('mph'),
});
export const createSpeedThresholdSchema = thresholdFields.refine(
  (data) => data.normalMaximum < data.warningMaximum,
  { message: 'normalMaximum must be strictly less than warningMaximum', path: ['normalMaximum'] },
);
export const updateSpeedThresholdSchema = thresholdFields.partial();
export const detectionQuerySchema = z.object({
  sessionId: idSchema.optional(),
  classification: vehicleClassificationSchema.optional(),
  vehicleType: name.optional(),
  from: dateTime.optional(),
  to: dateTime.optional(),
  limit: z.coerce.number().int().positive().max(500).default(50),
}).refine((data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to), {
  message: 'from must be before or equal to to', path: ['from'],
});
export const createReportSchema = z.object({
  name,
  sessionId: idSchema,
  reportType: name.default('SPEED_AUDIT'),
});
