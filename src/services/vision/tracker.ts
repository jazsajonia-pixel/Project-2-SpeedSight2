import {
  PositionObservation,
  SpeedQuality,
  SpeedClassification,
  SpeedUnit,
  DistanceUnit,
  calculateSpeedFromHistory,
  smoothSpeed,
  classifySpeed,
} from '../../utils/speedMath';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TrackedVehicle {
  trackingId: string;
  vehicleType: string;
  confidence: number;
  boundingBox: BoundingBox;
  lastSeenAt: number;
  firstSeenAt: number;
  positionHistory: PositionObservation[];
  estimatedSpeed: number;
  speedUnit: SpeedUnit;
  speedQuality: SpeedQuality;
  classification: SpeedClassification;
}

export interface CalibrationParams {
  scale: number;
  distanceUnit: DistanceUnit;
  speedUnit?: SpeedUnit;
  normalMaxThreshold?: number;
  warningMaxThreshold?: number;
}

// Calculate Intersection over Union (IoU) between two bounding boxes
export function calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  if (interArea === 0) return 0;

  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;

  return interArea / (boxAArea + boxBArea - interArea);
}

/**
 * Returns the bottom-center point of a bounding box.
 * Bottom-center is preferred for vehicle tracking because it represents
 * the vehicle's ground contact location on the road surface.
 */
export function getBottomCenterPoint(box: BoundingBox) {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height,
  };
}

export class ObjectTracker {
  private activeTracks: TrackedVehicle[] = [];
  private nextId = 1000;
  private iouThreshold = 0.3;
  private maxStaleTimeMs = 1500;
  private maxHistoryLength = 10;

  public update(
    detections: { vehicleType: string; confidence: number; boundingBox: BoundingBox }[],
    now = Date.now(),
    calibration?: CalibrationParams
  ): TrackedVehicle[] {
    const updatedTracks: TrackedVehicle[] = [];
    const unmatchedDetections = [...detections];

    // Association with existing active tracks
    for (const track of this.activeTracks) {
      if (now - track.lastSeenAt > this.maxStaleTimeMs) continue;

      let bestIoU = 0;
      let bestMatchIndex = -1;

      for (let i = 0; i < unmatchedDetections.length; i++) {
        const det = unmatchedDetections[i];
        if (det.vehicleType === track.vehicleType) {
          const iou = calculateIoU(track.boundingBox, det.boundingBox);
          if (iou > bestIoU && iou >= this.iouThreshold) {
            bestIoU = iou;
            bestMatchIndex = i;
          }
        }
      }

      if (bestMatchIndex !== -1) {
        const matched = unmatchedDetections.splice(bestMatchIndex, 1)[0];
        track.boundingBox = matched.boundingBox;
        track.confidence = matched.confidence;
        track.lastSeenAt = now;

        // Append bottom-center position to history
        const bottomCenter = getBottomCenterPoint(matched.boundingBox);
        track.positionHistory.push({ point: bottomCenter, timestamp: now });
        if (track.positionHistory.length > this.maxHistoryLength) {
          track.positionHistory.shift();
        }

        // Calculate speed if calibration exists
        this.computeTrackSpeed(track, calibration);

        updatedTracks.push(track);
      } else {
        // Keep active track if not stale
        if (now - track.lastSeenAt <= this.maxStaleTimeMs) {
          updatedTracks.push(track);
        }
      }
    }

    // Create new tracks for remaining unmatched detections
    for (const det of unmatchedDetections) {
      const bottomCenter = getBottomCenterPoint(det.boundingBox);
      const newTrack: TrackedVehicle = {
        trackingId: `VEH-${this.nextId++}`,
        vehicleType: det.vehicleType,
        confidence: det.confidence,
        boundingBox: det.boundingBox,
        lastSeenAt: now,
        firstSeenAt: now,
        positionHistory: [{ point: bottomCenter, timestamp: now }],
        estimatedSpeed: 0,
        speedUnit: calibration?.speedUnit || 'KMH',
        speedQuality: calibration?.scale ? 'LOW' : 'UNAVAILABLE',
        classification: 'NORMAL',
      };

      this.computeTrackSpeed(newTrack, calibration);
      updatedTracks.push(newTrack);
    }

    this.activeTracks = updatedTracks;
    return this.activeTracks.filter((t) => now - t.lastSeenAt < 500);
  }

  private computeTrackSpeed(track: TrackedVehicle, calibration?: CalibrationParams) {
    if (!calibration || !calibration.scale || calibration.scale <= 0) {
      track.estimatedSpeed = 0;
      track.speedQuality = 'UNAVAILABLE';
      track.classification = 'NORMAL';
      return;
    }

    const targetSpeedUnit = calibration.speedUnit || 'KMH';
    const res = calculateSpeedFromHistory(
      track.positionHistory,
      calibration.scale,
      calibration.distanceUnit,
      targetSpeedUnit
    );

    // Apply Exponential Moving Average (EMA) smoothing
    track.estimatedSpeed = smoothSpeed(track.estimatedSpeed, res.speed, 0.3);
    track.speedUnit = targetSpeedUnit;
    track.speedQuality = res.quality;

    const normalMax = calibration.normalMaxThreshold || (targetSpeedUnit === 'MPH' ? 30 : 50);
    const warningMax = calibration.warningMaxThreshold || (targetSpeedUnit === 'MPH' ? 45 : 65);

    track.classification = classifySpeed(track.estimatedSpeed, {
      normalMax,
      warningMax,
    });
  }

  public clear() {
    this.activeTracks = [];
    this.nextId = 1000;
  }
}
