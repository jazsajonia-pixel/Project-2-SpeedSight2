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

export class ObjectTracker {
  private activeTracks: TrackedVehicle[] = [];
  private nextId = 1000;
  private iouThreshold = 0.3;
  private maxStaleTimeMs = 1500;

  public update(
    detections: { vehicleType: string; confidence: number; boundingBox: BoundingBox }[],
    now = Date.now()
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
      const newTrack: TrackedVehicle = {
        trackingId: `VEH-${this.nextId++}`,
        vehicleType: det.vehicleType,
        confidence: det.confidence,
        boundingBox: det.boundingBox,
        lastSeenAt: now,
        firstSeenAt: now,
      };
      updatedTracks.push(newTrack);
    }

    this.activeTracks = updatedTracks;
    return this.activeTracks.filter((t) => now - t.lastSeenAt < 500);
  }

  public clear() {
    this.activeTracks = [];
    this.nextId = 1000;
  }
}
