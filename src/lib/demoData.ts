import { Detection, Session, CameraProfile, Report } from '../types';

export const DEMO_SESSIONS: Session[] = [
  {
    id: 'ses-101',
    name: 'Main St & 4th Ave Intersection',
    date: '2026-10-02 08:30',
    duration: '02:15:40',
    vehicleCount: 142,
    averageSpeed: 34.2,
    speedingEvents: 18,
    status: 'Active',
    location: 'Northbound Traffic'
  },
  {
    id: 'ses-102',
    name: 'Highway 101 Mile 42 North',
    date: '2026-10-01 14:00',
    duration: '05:00:00',
    vehicleCount: 1280,
    averageSpeed: 62.8,
    speedingEvents: 112,
    status: 'Completed',
    location: 'Lane 1 & 2'
  },
  {
    id: 'ses-103',
    name: 'School Zone - Oak Elementary',
    date: '2026-10-01 07:45',
    duration: '01:30:00',
    vehicleCount: 89,
    averageSpeed: 21.4,
    speedingEvents: 7,
    status: 'Completed',
    location: 'School Frontage'
  },
  {
    id: 'ses-104',
    name: 'Industrial Pkwy Delivery Zone',
    date: '2026-09-30 11:15',
    duration: '03:45:00',
    vehicleCount: 310,
    averageSpeed: 28.6,
    speedingEvents: 14,
    status: 'Completed',
    location: 'Gate A Entry'
  }
];

export const DEMO_DETECTIONS: Detection[] = [
  {
    id: 'det-001',
    timestamp: '09:42:15 AM',
    vehicleId: 'VEH-8492',
    vehicleType: 'Sedan',
    estimatedSpeed: 42,
    speedLimit: 30,
    classification: 'speeding',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    confidence: 0.94
  },
  {
    id: 'det-002',
    timestamp: '09:41:50 AM',
    vehicleId: 'VEH-8491',
    vehicleType: 'SUV',
    estimatedSpeed: 33,
    speedLimit: 30,
    classification: 'warning',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    confidence: 0.91
  },
  {
    id: 'det-003',
    timestamp: '09:41:02 AM',
    vehicleId: 'VEH-8490',
    vehicleType: 'Truck',
    estimatedSpeed: 28,
    speedLimit: 30,
    classification: 'normal',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    confidence: 0.88
  },
  {
    id: 'det-004',
    timestamp: '09:40:11 AM',
    vehicleId: 'VEH-8489',
    vehicleType: 'Motorcycle',
    estimatedSpeed: 48,
    speedLimit: 30,
    classification: 'speeding',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    confidence: 0.96
  },
  {
    id: 'det-005',
    timestamp: '09:38:44 AM',
    vehicleId: 'VEH-8488',
    vehicleType: 'Van',
    estimatedSpeed: 29,
    speedLimit: 30,
    classification: 'normal',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    confidence: 0.92
  },
  {
    id: 'det-006',
    timestamp: '09:35:10 AM',
    vehicleId: 'VEH-8487',
    vehicleType: 'Bus',
    estimatedSpeed: 25,
    speedLimit: 30,
    classification: 'normal',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    confidence: 0.95
  }
];

export const DEMO_CAMERAS: CameraProfile[] = [
  {
    id: 'cam-01',
    name: 'Front Entrance Cam (1080p)',
    type: 'Webcam',
    resolution: '1920x1080',
    frameRate: 60,
    quality: 'High',
    status: 'Online',
    location: 'Gate 1'
  },
  {
    id: 'cam-02',
    name: 'Main St Traffic Feed IP Cam',
    type: 'IP Camera',
    resolution: '2560x1440',
    frameRate: 30,
    quality: 'Ultra',
    status: 'Online',
    location: 'Pole #12'
  },
  {
    id: 'cam-03',
    name: 'Highway Overpass CCTV',
    type: 'CCTV Stream',
    resolution: '1280x720',
    frameRate: 30,
    quality: 'Medium',
    status: 'Offline',
    location: 'Overpass West'
  }
];

export const DEMO_REPORTS: Report[] = [
  {
    id: 'rep-01',
    name: 'Daily Speed Audit - Main St',
    sessionId: 'ses-101',
    sessionName: 'Main St & 4th Ave Intersection',
    date: '2026-10-02',
    totalVehicles: 142,
    avgSpeed: 34.2,
    maxSpeed: 54,
    speedingViolations: 18,
    status: 'Generated',
    fileSize: '1.4 MB'
  },
  {
    id: 'rep-02',
    name: 'Highway Traffic Density & Violation Report',
    sessionId: 'ses-102',
    sessionName: 'Highway 101 Mile 42 North',
    date: '2026-10-01',
    totalVehicles: 1280,
    avgSpeed: 62.8,
    maxSpeed: 89,
    speedingViolations: 112,
    status: 'Generated',
    fileSize: '8.2 MB'
  }
];
