import { fetchJson } from './http';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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

  getCurrentUser: (signal?: AbortSignal) =>
    fetchJson<{ user: AuthUser }>('/auth/me', { signal })
      .then((res) => res.user)
      .catch((err) => {
        if (err?.status === 401) return null;
        throw err;
      }),
};
