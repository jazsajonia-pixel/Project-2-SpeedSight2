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
