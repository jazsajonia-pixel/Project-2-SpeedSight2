export type DistanceUnit = 'FEET' | 'METERS';
export type SpeedUnit = 'MPH' | 'KMH';
export type SpeedQuality = 'GOOD' | 'FAIR' | 'LOW' | 'UNAVAILABLE';
export type SpeedClassification = 'NORMAL' | 'WARNING' | 'SPEEDING';

export interface Point2D {
  x: number;
  y: number;
}

export interface PositionObservation {
  point: Point2D;
  timestamp: number; // ms
}

export interface TwoPointCalibrationData {
  pointA: Point2D;
  pointB: Point2D;
  knownDistance: number;
  distanceUnit: DistanceUnit;
  pixelDistance: number;
  scale: number; // physical distance per pixel
}

export interface SpeedCalculationResult {
  speed: number; // in requested SpeedUnit
  unit: SpeedUnit;
  quality: SpeedQuality;
  rawSpeed: number;
}

export interface SpeedThresholdConfig {
  normalMax: number;  // e.g. 50 km/h or 30 mph
  warningMax: number; // e.g. 65 km/h or 45 mph
}

export const DISCLAIMER_MESSAGE =
  'Speed measurements are estimated calculations for analytics/research purposes and not legally certified speed enforcement.';

/**
 * Calculates Euclidean distance between two 2D points in pixel space.
 */
export function calculatePixelDistance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates calibration scale (physical distance per pixel).
 */
export function calculateCalibrationScale(
  pixelDistance: number,
  knownDistance: number
): number {
  if (pixelDistance <= 0 || knownDistance <= 0) {
    return 0;
  }
  return knownDistance / pixelDistance;
}

/**
 * Converts a pixel distance to physical distance using the calibration scale.
 */
export function calculatePhysicalDistance(
  pixelDistance: number,
  scale: number
): number {
  if (pixelDistance <= 0 || scale <= 0) return 0;
  return pixelDistance * scale;
}

/**
 * Converts speed between MPH and KM/H.
 */
export function convertSpeedUnit(
  value: number,
  fromUnit: SpeedUnit,
  toUnit: SpeedUnit
): number {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'MPH' && toUnit === 'KMH') {
    return value * 1.609344;
  }
  if (fromUnit === 'KMH' && toUnit === 'MPH') {
    return value / 1.609344;
  }
  return value;
}

/**
 * Calculates vehicle speed based on position history and calibration scale.
 */
export function calculateSpeedFromHistory(
  history: PositionObservation[],
  scale: number,
  distanceUnit: DistanceUnit,
  targetSpeedUnit: SpeedUnit = 'KMH'
): SpeedCalculationResult {
  if (!history || history.length < 2 || scale <= 0) {
    return { speed: 0, unit: targetSpeedUnit, quality: 'UNAVAILABLE', rawSpeed: 0 };
  }

  const oldest = history[0];
  const newest = history[history.length - 1];

  const elapsedMs = newest.timestamp - oldest.timestamp;
  if (elapsedMs <= 0) {
    return { speed: 0, unit: targetSpeedUnit, quality: 'UNAVAILABLE', rawSpeed: 0 };
  }

  const elapsedSeconds = elapsedMs / 1000;
  // Reject unrealistic frame jumps (e.g., > 10 seconds gap)
  if (elapsedSeconds > 10) {
    return { speed: 0, unit: targetSpeedUnit, quality: 'UNAVAILABLE', rawSpeed: 0 };
  }

  const pixelDist = calculatePixelDistance(oldest.point, newest.point);
  const physicalDist = calculatePhysicalDistance(pixelDist, scale); // in distanceUnit (ft or m)

  if (physicalDist <= 0) {
    return { speed: 0, unit: targetSpeedUnit, quality: 'LOW', rawSpeed: 0 };
  }

  // Calculate speed in physical distance units per second
  const speedPerSecond = physicalDist / elapsedSeconds;

  let speedInMph = 0;
  if (distanceUnit === 'FEET') {
    // 1 ft/s = 0.681818 mph
    speedInMph = speedPerSecond * 0.681818;
  } else {
    // METERS
    // 1 m/s = 2.236936 mph
    speedInMph = speedPerSecond * 2.236936;
  }

  const rawSpeed = targetSpeedUnit === 'MPH' ? speedInMph : speedInMph * 1.609344;

  // Determine speed quality
  let quality: SpeedQuality = 'GOOD';
  if (history.length < 3 || elapsedSeconds < 0.2) {
    quality = 'LOW';
  } else if (history.length < 5 || elapsedSeconds < 0.4) {
    quality = 'FAIR';
  }

  // Sanity filter: speed > 250 km/h or 155 mph usually indicates noisy bounding box jump
  const maxSpeedKmh = 250;
  const speedKmh = targetSpeedUnit === 'KMH' ? rawSpeed : rawSpeed * 1.609344;
  if (speedKmh > maxSpeedKmh) {
    quality = 'LOW';
  }

  return {
    speed: Math.round(rawSpeed * 10) / 10,
    unit: targetSpeedUnit,
    quality,
    rawSpeed,
  };
}

/**
 * Applies exponential moving average (EMA) smoothing to speed readings.
 */
export function smoothSpeed(
  previousSmoothSpeed: number,
  currentRawSpeed: number,
  alpha = 0.3
): number {
  if (previousSmoothSpeed === 0) return currentRawSpeed;
  return Math.round((alpha * currentRawSpeed + (1 - alpha) * previousSmoothSpeed) * 10) / 10;
}

/**
 * Classifies speed against configured normal/warning/speeding thresholds.
 */
export function classifySpeed(
  speed: number,
  thresholds: SpeedThresholdConfig
): SpeedClassification {
  if (speed <= 0) return 'NORMAL';
  if (speed <= thresholds.normalMax) {
    return 'NORMAL';
  }
  if (speed <= thresholds.warningMax) {
    return 'WARNING';
  }
  return 'SPEEDING';
}
