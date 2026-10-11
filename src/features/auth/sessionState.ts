import { ApiError } from '../../services/http';

export function isUnauthenticatedSessionError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function getSessionCheckMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 500) {
    return 'The session service is temporarily unavailable. Your account was not signed out. Try again in a moment.';
  }

  if (error instanceof ApiError && error.status === 403) {
    return 'Your session is not allowed to access this application. Please sign in again.';
  }

  return 'Unable to check your authentication session. Please check your network connection and try again.';
}
