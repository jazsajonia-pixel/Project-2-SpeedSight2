import { fetchJson } from './http';
import type {
  MonitoringSession, CameraConfiguration, CalibrationProfile, SpeedThreshold, VehicleDetection,
  DashboardStatistics, SavedReport, SessionInput, SessionUpdate, CameraInput, CalibrationInput,
  ThresholdInput, ReportInput, DetectionQuery,
} from '../types/api';

type Data<T> = { data: T };
type Deleted = Data<{ id: string; deleted: boolean }>;
const item = (path: string, id: string) => `${path}/${encodeURIComponent(id)}`;
const body = (method: string, data: unknown) => ({ method, body: JSON.stringify(data) });

export const api = {
  getHealth: () => fetchJson<{ status: string; database: string }>('/health'),
  getSessions: () => fetchJson<Data<MonitoringSession[]>>('/sessions'),
  getSession: (id: string) => fetchJson<Data<MonitoringSession>>(item('/sessions', id)),
  createSession: (data: SessionInput) => fetchJson<Data<MonitoringSession>>('/sessions', body('POST', data)),
  updateSession: (id: string, data: SessionUpdate) => fetchJson<Data<MonitoringSession>>(item('/sessions', id), body('PATCH', data)),
  deleteSession: (id: string) => fetchJson<Deleted>(item('/sessions', id), { method: 'DELETE' }),
  getCameras: () => fetchJson<Data<CameraConfiguration[]>>('/cameras'),
  getCamera: (id: string) => fetchJson<Data<CameraConfiguration>>(item('/cameras', id)),
  createCamera: (data: CameraInput) => fetchJson<Data<CameraConfiguration>>('/cameras', body('POST', data)),
  updateCamera: (id: string, data: Partial<CameraInput>) => fetchJson<Data<CameraConfiguration>>(item('/cameras', id), body('PATCH', data)),
  deleteCamera: (id: string) => fetchJson<Deleted>(item('/cameras', id), { method: 'DELETE' }),
  getCalibrations: () => fetchJson<Data<CalibrationProfile[]>>('/calibrations'),
  getCalibration: (id: string) => fetchJson<Data<CalibrationProfile>>(item('/calibrations', id)),
  createCalibration: (data: CalibrationInput) => fetchJson<Data<CalibrationProfile>>('/calibrations', body('POST', data)),
  updateCalibration: (id: string, data: Partial<CalibrationInput>) => fetchJson<Data<CalibrationProfile>>(item('/calibrations', id), body('PATCH', data)),
  deleteCalibration: (id: string) => fetchJson<Deleted>(item('/calibrations', id), { method: 'DELETE' }),
  getSpeedThresholds: () => fetchJson<Data<SpeedThreshold[]>>('/speed-thresholds'),
  getSpeedThreshold: (id: string) => fetchJson<Data<SpeedThreshold>>(item('/speed-thresholds', id)),
  createSpeedThreshold: (data: ThresholdInput) => fetchJson<Data<SpeedThreshold>>('/speed-thresholds', body('POST', data)),
  updateSpeedThreshold: (id: string, data: Partial<ThresholdInput>) => fetchJson<Data<SpeedThreshold>>(item('/speed-thresholds', id), body('PATCH', data)),
  deleteSpeedThreshold: (id: string) => fetchJson<Deleted>(item('/speed-thresholds', id), { method: 'DELETE' }),
  getDetections: (params: DetectionQuery = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
    return fetchJson<Data<VehicleDetection[]>>(`/detections?${query}`);
  },
  getDetection: (id: string) => fetchJson<Data<VehicleDetection>>(item('/detections', id)),
  getDashboardStats: () => fetchJson<Data<DashboardStatistics>>('/dashboard/stats'),
  getReports: () => fetchJson<Data<SavedReport[]>>('/reports'),
  getReport: (id: string) => fetchJson<Data<SavedReport>>(item('/reports', id)),
  createReport: (data: ReportInput) => fetchJson<Data<SavedReport>>('/reports', body('POST', data)),
  deleteReport: (id: string) => fetchJson<Deleted>(item('/reports', id), { method: 'DELETE' }),
};
