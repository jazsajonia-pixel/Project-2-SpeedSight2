import { describe, expect, it, vi } from 'vitest';
import { DetectionModel, VehicleDetector } from './detector';

const fakeInput = {} as HTMLVideoElement;

function makeModel(predictions: Array<{ class: string; score: number; bbox: [number, number, number, number] }>): DetectionModel {
  return { detect: vi.fn().mockResolvedValue(predictions) } as unknown as DetectionModel;
}

describe('VehicleDetector', () => {
  it('loads the model once when concurrent callers initialize it', async () => {
    const model = makeModel([]);
    const load = vi.fn().mockResolvedValue(model);
    const detector = new VehicleDetector(load);
    await Promise.all([detector.initialize(), detector.initialize()]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(detector.isReady()).toBe(true);
  });

  it('returns only supported vehicles that meet the selected confidence threshold', async () => {
    const model = makeModel([
      { class: 'car', score: 0.82, bbox: [10, 20, 100, 60] },
      { class: 'truck', score: 0.61, bbox: [150, 30, 120, 80] },
      { class: 'person', score: 0.99, bbox: [300, 30, 30, 90] },
    ]);
    const detector = new VehicleDetector(async () => model);
    await detector.initialize();

    const tracks = await detector.detectAndTrack(fakeInput, 0.7);

    expect(model.detect).toHaveBeenCalledWith(fakeInput, 20, 0.7);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({ vehicleType: 'Sedan', confidence: 0.82, boundingBox: { x: 10, y: 20, width: 100, height: 60 } });
  });

  it('filters model output below its default minimum score', async () => {
    const model = makeModel([{ class: 'bus', score: 0.2, bbox: [0, 0, 10, 10] }]);
    const detector = new VehicleDetector(async () => model);
    await detector.initialize();
    expect(await detector.detectAndTrack(fakeInput)).toEqual([]);
  });
});
