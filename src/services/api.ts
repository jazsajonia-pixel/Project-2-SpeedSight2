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

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; database: string }>('/health'),

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
