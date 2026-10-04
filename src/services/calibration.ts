import { TwoPointCalibrationData, SpeedUnit } from '../utils/speedMath';

export interface ActiveCalibrationProfile {
  id: string;
  name: string;
  method: 'TWO_POINT';
  data: TwoPointCalibrationData;
  speedUnit: SpeedUnit;
  createdAt: string;
  updatedAt: string;
}

const CALIBRATION_STORAGE_KEY = 'speedsight_active_calibration';

export const DEFAULT_CALIBRATION: ActiveCalibrationProfile = {
  id: 'default-two-point',
  name: 'Default 50ft Calibration',
  method: 'TWO_POINT',
  data: {
    pointA: { x: 200, y: 400 },
    pointB: { x: 1000, y: 400 },
    knownDistance: 50,
    distanceUnit: 'FEET',
    pixelDistance: 800,
    scale: 50 / 800, // 0.0625 feet/pixel
  },
  speedUnit: 'MPH',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const calibrationService = {
  getActiveProfile: (): ActiveCalibrationProfile | null => {
    const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as ActiveCalibrationProfile;
      } catch {
        localStorage.removeItem(CALIBRATION_STORAGE_KEY);
      }
    }
    return DEFAULT_CALIBRATION;
  },

  saveProfile: (profile: ActiveCalibrationProfile): ActiveCalibrationProfile => {
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  },

  clearProfile: (): void => {
    localStorage.removeItem(CALIBRATION_STORAGE_KEY);
  },
};
