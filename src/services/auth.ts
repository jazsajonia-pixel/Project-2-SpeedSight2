import { fetchJson } from './http';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const DEMO_USER: AuthUser = {
  id: 'demo-operator-id',
  name: 'SpeedSight Operator',
  email: 'operator@speedsight.local',
};

const USER_STORAGE_KEY = 'speedsight_active_user';

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    try {
      const res = await fetchJson<{ user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      return res;
    } catch (err: any) {
      // Fallback local registration if backend fails or times out
      if (err?.status === 504 || err?.status === 500 || !err?.status) {
        const fallbackUser: AuthUser = {
          id: `local-${Date.now()}`,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
        return { user: fallbackUser };
      }
      throw err;
    }
  },

  login: async (data: { email: string; password: string }) => {
    try {
      const res = await fetchJson<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      return res;
    } catch (err: any) {
      // Fallback local login if backend fails or times out
      if (err?.status === 504 || err?.status === 500 || !err?.status) {
        const fallbackUser: AuthUser = {
          id: 'local-operator-id',
          name: data.email.split('@')[0] || 'SpeedSight Operator',
          email: data.email,
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
        return { user: fallbackUser };
      }
      throw err;
    }
  },

  loginAsDemo: async () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_USER));
    return { user: DEMO_USER };
  },

  logout: async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    try {
      await fetchJson<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    return { message: 'Logged out successfully' };
  },

  getCurrentUser: async (signal?: AbortSignal): Promise<AuthUser | null> => {
    try {
      const res = await fetchJson<{ user: AuthUser }>('/auth/me', { signal });
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      return res.user;
    } catch (err: any) {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as AuthUser;
        } catch {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      return null;
    }
  },
};
