import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectTracker, TrackedVehicle } from './tracker';

export const VEHICLE_CLASSES = new Set(['car', 'truck', 'bus', 'motorcycle']);

export class VehicleDetector {
  private model: cocoSsd.ObjectDetection | null = null;
  private isInitializing = false;
  private tracker = new ObjectTracker();

  public async initialize(): Promise<void> {
    if (this.model || this.isInitializing) return;

    this.isInitializing = true;
    try {
      await tf.ready();
      this.model = await cocoSsd.load({
        base: 'lite_mobilenet_v2',
      });
      console.log('SpeedSight COCO-SSD Vehicle Detection Model loaded successfully.');
    } catch (err) {
      console.error('Failed to load TensorFlow.js COCO-SSD model:', err);
      throw new Error('Computer vision model initialization failed.');
    } finally {
      this.isInitializing = false;
    }
  }

  public isReady(): boolean {
    return this.model !== null;
  }

  public async detectAndTrack(
    imageElement: HTMLVideoElement | HTMLCanvasElement
  ): Promise<TrackedVehicle[]> {
    if (!this.model) return [];

    try {
      const predictions = await this.model.detect(imageElement, 10, 0.3);

      const vehicleDetections = predictions
        .filter((pred) => VEHICLE_CLASSES.has(pred.class.toLowerCase()))
        .map((pred) => {
          const [x, y, width, height] = pred.bbox;
          let vehicleType = pred.class.charAt(0).toUpperCase() + pred.class.slice(1);
          if (vehicleType === 'Car') vehicleType = 'Sedan';

          return {
            vehicleType,
            confidence: Math.round(pred.score * 100) / 100,
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
