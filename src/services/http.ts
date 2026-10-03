import type { ApiErrorResponse } from '../types/api';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${url}`, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (!res.ok) {
    const body: Partial<ApiErrorResponse> = await res.json().catch(() => ({}));
    if (res.status === 401 && url !== '/auth/me' && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('speedsight:unauthorized'));
    }
    throw new ApiError(
      res.status,
      body.error?.code || 'REQUEST_FAILED',
      body.error?.message || 'Unable to complete the request. Please try again.'
    );
  }

  return res.json();
}
