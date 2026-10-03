export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    fetchJson<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchJson<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchJson<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () => fetchJson<{ user: AuthUser }>('/auth/me'),
};

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; service: string; database: string; timestamp: string }>('/health'),

  // Sessions
  getSessions: () => fetchJson<{ data: any[] }>('/sessions'),
  getSession: (id: string) => fetchJson<{ data: any }>(`/sessions/${id}`),
  createSession: (data: any) =>
    fetchJson<{ data: any }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSession: (id: string, data: any) =>
    fetchJson<{ data: any }>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteSession: (id: string) =>
    fetchJson<{ data: any }>(`/sessions/${id}`, {
      method: 'DELETE',
    }),

  // Cameras
  getCameras: () => fetchJson<{ data: any[] }>('/cameras'),
  createCamera: (data: any) =>
    fetchJson<{ data: any }>('/cameras', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Calibrations
  getCalibrations: () => fetchJson<{ data: any[] }>('/calibrations'),
  createCalibration: (data: any) =>
    fetchJson<{ data: any }>('/calibrations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Speed Thresholds
  getSpeedThresholds: () => fetchJson<{ data: any[] }>('/speed-thresholds'),
  createSpeedThreshold: (data: any) =>
    fetchJson<{ data: any }>('/speed-thresholds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Detections
  getDetections: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<{ data: any[] }>(`/detections${query}`);
  },

  // Dashboard Stats
  getDashboardStats: () =>
    fetchJson<{
      data: {
        vehiclesDetected: number;
        averageSpeed: number;
        maximumSpeed: number;
        speedingEvents: number;
        activeSessions: number;
      };
    }>('/dashboard/stats'),

  // Reports
  getReports: () => fetchJson<{ data: any[] }>('/reports'),
  createReport: (data: any) =>
    fetchJson<{ data: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
