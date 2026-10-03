import type { ApiErrorResponse } from '../types/api';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const signal = options?.signal
    ? (options.signal.addEventListener('abort', () => controller.abort()), controller.signal)
    : controller.signal;

  let res: Response;
  try {
    res = await fetch(`/api${url}`, {
      ...options,
      signal,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError(504, 'TIMEOUT', 'Request timed out after 6 seconds. Please try again or use Demo Mode.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

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
