export type SpeedClassification = 'normal' | 'warning' | 'speeding';
export type VehicleClassification = 'NORMAL' | 'WARNING' | 'SPEEDING';

export interface VehicleDetection {
  id: string;
  sessionId: string;
  trackingId: string;
  vehicleType: string;
  estimatedSpeed: number;
  speedUnit: string;
  classification: VehicleClassification;
  confidence: number;
  boundingBox: any;
  detectedAt: string;
}

export interface Detection {
  id: string;
  timestamp: string;
  vehicleId: string;
  vehicleType: 'Car' | 'Truck' | 'SUV' | 'Motorcycle' | 'Bus' | 'Van';
  estimatedSpeed: number; // in mph or km/h
  speedLimit: number;
  classification: SpeedClassification;
  sessionId: string;
  sessionName: string;
  confidence: number;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  duration: string; // e.g. "01:45:20"
  vehicleCount: number;
  averageSpeed: number;
  speedingEvents: number;
  status: 'Active' | 'Completed' | 'Paused';
  location: string;
}

export interface CameraProfile {
  id: string;
  name: string;
  type: 'Webcam' | 'IP Camera' | 'CCTV Stream' | 'Recorded Video';
  resolution: string;
  frameRate: number;
  quality: 'Low' | 'Medium' | 'High' | 'Ultra';
  status: 'Online' | 'Offline' | 'Configuring';
  location: string;
}

export interface Report {
  id: string;
  name: string;
  sessionId: string;
  sessionName: string;
  date: string;
  totalVehicles: number;
  avgSpeed: number;
  maxSpeed: number;
  speedingViolations: number;
  status: 'Generated' | 'Processing' | 'Archived';
  fileSize: string;
}
