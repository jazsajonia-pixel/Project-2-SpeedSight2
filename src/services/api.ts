import { VehicleDetection, VehicleClassification } from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage = `HTTP error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error?.message) {
        errorMessage = errData.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Health
  async getHealth() {
    return fetchJson<{ status: string; service: string; database: string; timestamp: string }>('/api/health');
  },

  // Auth
  async register(data: any) {
    return fetchJson<{ user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: any) {
    return fetchJson<{ user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    return fetchJson<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser() {
    return fetchJson<{ user: any }>('/api/auth/me');
  },

  // Sessions
  async getSessions() {
    return fetchJson<{ data: any[] }>('/api/sessions');
  },

  async getSession(id: string) {
    return fetchJson<{ data: any }>(`/api/sessions/${id}`);
  },

  async createSession(data: { name: string; description?: string; status?: string }) {
    return fetchJson<{ data: any }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSession(id: string, data: any) {
    return fetchJson<{ data: any }>(`/api/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteSession(id: string) {
    return fetchJson<{ data: any }>(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  // Cameras
  async getCameras() {
    return fetchJson<{ data: any[] }>('/api/cameras');
  },

  async createCamera(data: any) {
    return fetchJson<{ data: any }>('/api/cameras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCamera(id: string, data: any) {
    return fetchJson<{ data: any }>(`/api/cameras/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCamera(id: string) {
    return fetchJson<{ data: any }>(`/api/cameras/${id}`, {
      method: 'DELETE',
    });
  },

  // Calibrations
  async getCalibrations() {
    return fetchJson<{ data: any[] }>('/api/calibrations');
  },

  async createCalibration(data: any) {
    return fetchJson<{ data: any }>('/api/calibrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Speed Thresholds
  async getSpeedThresholds() {
    return fetchJson<{ data: any[] }>('/api/speed-thresholds');
  },

  async createSpeedThreshold(data: any) {
    return fetchJson<{ data: any }>('/api/speed-thresholds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Detections
  async getDetections(filters?: { sessionId?: string; vehicleType?: string; classification?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<{ data: VehicleDetection[] }>(`/api/detections${query}`);
  },

  async createDetection(data: {
    sessionId: string;
    trackingId: string;
    vehicleType: string;
    estimatedSpeed: number;
    speedUnit?: string;
    classification?: VehicleClassification;
    confidence: number;
    boundingBox?: any;
  }) {
    return fetchJson<{ data: VehicleDetection }>('/api/detections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Dashboard Stats
  async getDashboardStats() {
    return fetchJson<{
      data: {
        vehiclesDetected: number;
        averageSpeed: number;
        maximumSpeed: number;
        speedingEvents: number;
        activeSessions: number;
      };
    }>('/api/dashboard/stats');
  },

  // Reports
  async getReports() {
    return fetchJson<{ data: any[] }>('/api/reports');
  },

  async createReport(data: any) {
    return fetchJson<{ data: any }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteReport(id: string) {
    return fetchJson<{ data: any }>(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  },
};
