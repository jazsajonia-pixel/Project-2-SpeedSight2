import type * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectTracker, TrackedVehicle } from './tracker';

export const VEHICLE_CLASSES = new Set(['car', 'truck', 'bus', 'motorcycle']);
export type VisionInput = HTMLVideoElement | HTMLCanvasElement;
export type DetectionModel = Pick<cocoSsd.ObjectDetection, 'detect'>;
type ModelLoader = () => Promise<DetectionModel>;

const loadCocoSsdModel: ModelLoader = async () => {
  const [tf, cocoSsd] = await Promise.all([
    import('@tensorflow/tfjs'),
    import('@tensorflow-models/coco-ssd'),
  ]);
  await tf.ready();
  return cocoSsd.load({ base: 'lite_mobilenet_v2' });
};

export class VehicleDetector {
  private model: DetectionModel | null = null;
  private initialization: Promise<void> | null = null;
  private tracker = new ObjectTracker();

  constructor(private readonly modelLoader: ModelLoader = loadCocoSsdModel) {}

  public async initialize(): Promise<void> {
    if (this.model) return;
    if (this.initialization) return this.initialization;
    this.initialization = this.modelLoader()
      .then((model) => { this.model = model; })
      .catch((err) => {
        console.error('Failed to load TensorFlow.js COCO-SSD model:', err);
        throw new Error('Computer vision model initialization failed. Check your connection and reload the page.');
      })
      .finally(() => { this.initialization = null; });
    return this.initialization;
  }

  public isReady(): boolean {
    return this.model !== null;
  }

  public async detectAndTrack(imageElement: VisionInput, minConfidence = 0.3): Promise<TrackedVehicle[]> {
    if (!this.model) return [];
    const scoreThreshold = Math.min(0.95, Math.max(0.1, minConfidence));
    try {
      const predictions = await this.model.detect(imageElement, 20, scoreThreshold);
      const vehicleDetections = predictions
        .filter((prediction) => VEHICLE_CLASSES.has(prediction.class.toLowerCase()) && prediction.score >= scoreThreshold)
        .map((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          return {
            vehicleType: prediction.class.toLowerCase() === 'car' ? 'Sedan' : prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1),
            confidence: Math.round(prediction.score * 100) / 100,
            boundingBox: { x, y, width, height },
          };
        });
      return this.tracker.update(vehicleDetections);
    } catch (err) {
      console.error('Detection frame error:', err);
      return [];
    }
  }

  public resetTracker() {
    this.tracker.clear();
  }
}

export const vehicleDetector = new VehicleDetector();
