import { describe, it, expect } from 'vitest';
import {
  calculatePixelDistance,
  calculateCalibrationScale,
  calculatePhysicalDistance,
  convertSpeedUnit,
  calculateSpeedFromHistory,
  classifySpeed,
  PositionObservation,
} from '../utils/speedMath';

describe('Speed & Calibration Math Utilities', () => {
  it('1. Distance between identical points is 0', () => {
    const p1 = { x: 100, y: 100 };
    expect(calculatePixelDistance(p1, p1)).toBe(0);
  });

  it('2. Known calibration distance produces expected scale', () => {
    const pixelDistance = 500;
    const knownDistance = 50; // ft
    const scale = calculateCalibrationScale(pixelDistance, knownDistance);
    expect(scale).toBe(0.1); // 0.1 ft/pixel
  });

  it('3. Physical distance calculated correctly', () => {
    const scale = 0.1;
    expect(calculatePhysicalDistance(200, scale)).toBe(20);
  });

  it('4. Zero elapsed time returns UNAVAILABLE without NaN/Infinity', () => {
    const history: PositionObservation[] = [
      { point: { x: 100, y: 100 }, timestamp: 1000 },
      { point: { x: 200, y: 100 }, timestamp: 1000 },
    ];
    const res = calculateSpeedFromHistory(history, 0.1, 'FEET', 'MPH');
    expect(res.speed).toBe(0);
    expect(res.quality).toBe('UNAVAILABLE');
    expect(Number.isNaN(res.speed)).toBe(false);
  });

  it('5. Negative/invalid time handled safely', () => {
    const history: PositionObservation[] = [
      { point: { x: 100, y: 100 }, timestamp: 2000 },
      { point: { x: 200, y: 100 }, timestamp: 1000 },
    ];
    const res = calculateSpeedFromHistory(history, 0.1, 'FEET', 'MPH');
    expect(res.speed).toBe(0);
    expect(res.quality).toBe('UNAVAILABLE');
  });

  it('6. Speed calculation produces expected MPH for moving points', () => {
    // 50 feet in 1 second = 50 ft/s = ~34.1 mph
    const history: PositionObservation[] = [
      { point: { x: 0, y: 0 }, timestamp: 1000 },
      { point: { x: 100, y: 0 }, timestamp: 1200 },
      { point: { x: 200, y: 0 }, timestamp: 1400 },
      { point: { x: 300, y: 0 }, timestamp: 1600 },
      { point: { x: 400, y: 0 }, timestamp: 1800 },
      { point: { x: 500, y: 0 }, timestamp: 2000 },
    ];
    const scale = 0.1; // 50 feet total pixel dist 500 -> 50 ft
    const res = calculateSpeedFromHistory(history, scale, 'FEET', 'MPH');
    expect(res.speed).toBeGreaterThan(33);
    expect(res.speed).toBeLessThan(35);
    expect(res.quality).toBe('GOOD');
  });

  it('7. mph <-> km/h conversion works accurately', () => {
    expect(convertSpeedUnit(60, 'MPH', 'KMH')).toBeCloseTo(96.56, 1);
    expect(convertSpeedUnit(100, 'KMH', 'MPH')).toBeCloseTo(62.14, 1);
  });

  it('8. Speed classification respects configured thresholds', () => {
    const thresholds = { normalMax: 50, warningMax: 65 };
    expect(classifySpeed(40, thresholds)).toBe('NORMAL');
    expect(classifySpeed(55, thresholds)).toBe('WARNING');
    expect(classifySpeed(75, thresholds)).toBe('SPEEDING');
  });

  it('9. Invalid calibration (scale = 0) produces unavailable speed', () => {
    const history: PositionObservation[] = [
      { point: { x: 100, y: 100 }, timestamp: 1000 },
      { point: { x: 200, y: 100 }, timestamp: 2000 },
    ];
    const res = calculateSpeedFromHistory(history, 0, 'FEET', 'MPH');
    expect(res.speed).toBe(0);
    expect(res.quality).toBe('UNAVAILABLE');
  });

  it('10. Insufficient tracking history produces LOW quality', () => {
    const history: PositionObservation[] = [
      { point: { x: 100, y: 100 }, timestamp: 1000 },
      { point: { x: 110, y: 100 }, timestamp: 1050 },
    ];
    const res = calculateSpeedFromHistory(history, 0.1, 'FEET', 'MPH');
    expect(res.quality).toBe('LOW');
  });
});
