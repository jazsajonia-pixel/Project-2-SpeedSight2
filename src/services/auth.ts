import { ApiError, fetchJson } from './http';

export interface AuthUser {
  id: string;
  name: string | null;
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

  getCurrentUser: async (signal?: AbortSignal): Promise<AuthUser | null> => {
    try {
      return (await fetchJson<{ user: AuthUser }>('/auth/me', { signal })).user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
};
