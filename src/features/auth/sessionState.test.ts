import { describe, expect, it } from 'vitest';
import { ApiError } from '../../services/http';
import { getSessionCheckMessage, isUnauthenticatedSessionError } from './sessionState';

describe('session state helpers', () => {
  it('treats only a 401 as an unauthenticated session', () => {
    expect(isUnauthenticatedSessionError(new ApiError(401, 'UNAUTHORIZED', 'Session expired'))).toBe(true);
    expect(isUnauthenticatedSessionError(new ApiError(503, 'SERVICE_UNAVAILABLE', 'Database timeout'))).toBe(false);
    expect(isUnauthenticatedSessionError(new Error('Network failure'))).toBe(false);
  });

  it('gives transient backend failures an actionable retry message', () => {
    expect(getSessionCheckMessage(new ApiError(503, 'SERVICE_UNAVAILABLE', 'Database timeout'))).toContain('temporarily unavailable');
    expect(getSessionCheckMessage(new Error('Network failure'))).toContain('network connection');
  });
});
