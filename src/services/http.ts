import type { ApiErrorResponse } from '../types/api';

export class ApiError extends Error {
  /**
   * Creates an API request error with its HTTP status and application error code.
   *
   * @param status - HTTP response status.
   * @param code - API error code or the client's fallback code.
   * @param message - Error description for the caller.
   */
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

/**
 * Requests JSON from an API path using same-origin credentials.
 * Emits `speedsight:unauthorized` for 401 responses outside `/auth/` routes.
 *
 * @param url - Path appended to `/api`, including its leading slash.
 * @param options - Fetch options, including an optional abort signal.
 * @returns The parsed response body as T without runtime type validation.
 * @throws {ApiError} When the server returns an unsuccessful HTTP status.
 */
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
