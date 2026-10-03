// Database API DTOs. Phase 2 sample view models remain in types/index.ts.
export type SessionStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type SourceType = 'CAMERA' | 'VIDEO' | 'DEMO';
export type Classification = 'NORMAL' | 'WARNING' | 'SPEEDING';
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
interface RecordDates { id: string; createdAt: string; updatedAt: string }
export interface MonitoringSession extends RecordDates {
  userId: string; name: string; description: string | null; status: SessionStatus;
  startedAt: string | null; endedAt: string | null;
  trafficSummaries?: TrafficSummary[]; vehicleDetections?: VehicleDetection[];
}
export interface CameraConfiguration extends RecordDates {
  userId: string; name: string; description: string | null; sourceType: SourceType;
  resolution: string | null; frameRate: number | null; processingQuality: string;
}
export interface CalibrationProfile extends RecordDates {
  userId: string; name: string; knownDistance: number; distanceUnit: string; calibrationData: JsonValue;
}
export interface SpeedThreshold extends RecordDates {
  userId: string; name: string; normalMaximum: number; warningMaximum: number; unit: string;
}
export interface VehicleDetection {
  id: string; sessionId: string; trackingId: string; vehicleType: string; estimatedSpeed: number;
  speedUnit: string; classification: Classification; detectedAt: string; confidence: number | null;
  boundingBox: JsonValue; snapshotUrl: string | null; createdAt: string;
  session?: MonitoringSession;
  events?: { id: string; detectionId: string; eventType: 'DETECTED' | 'SPEED_WARNING' | 'SPEEDING' | 'SESSION_STARTED' | 'SESSION_STOPPED'; createdAt: string }[];
}
export interface TrafficSummary extends RecordDates {
  sessionId: string; vehicleCount: number; averageSpeed: number; maximumSpeed: number;
  speedingCount: number; warningCount: number; normalCount: number;
}
export interface DashboardStatistics {
  vehiclesDetected: number; averageSpeed: number; maximumSpeed: number; speedingEvents: number; activeSessions: number;
}
export interface SavedReport extends RecordDates {
  name: string; sessionId: string; reportType: string; session?: MonitoringSession;
}
export interface ApiErrorResponse { error: { code: string; message: string; details?: unknown } }
export interface SessionInput { name: string; description?: string }
export type SessionUpdate = Partial<SessionInput> & { status?: SessionStatus; startedAt?: string | null; endedAt?: string | null };
export interface CameraInput { name: string; description?: string; sourceType?: SourceType; resolution?: string; frameRate?: number; processingQuality?: 'Low' | 'Medium' | 'High' | 'Ultra' }
export interface CalibrationInput { name: string; knownDistance: number; distanceUnit?: 'm' | 'ft'; calibrationData?: Record<string, JsonValue> }
export interface ThresholdInput { name: string; normalMaximum: number; warningMaximum: number; unit?: 'mph' | 'km/h' }
export interface ReportInput { name: string; sessionId: string; reportType?: string }
export interface DetectionQuery { sessionId?: string; classification?: Classification; vehicleType?: string; from?: string; to?: string; limit?: number }
