import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, CURRENT_USER_KEY, useAuth } from '../features/auth/AuthContext';
import { authApi } from '../services/auth';
import { ApiError } from '../services/http';

vi.mock('../services/auth', () => ({ authApi: { getCurrentUser: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() } }));
const user = { id: 'a', name: 'User A', email: 'a@example.com' };
function Consumer() {
  const { user, isLoading, error, login, logout } = useAuth();
  return <><span>{isLoading ? 'Loading' : error ? 'Network error' : user?.name ?? 'Guest'}</span>
    <button onClick={() => { void login({ email: 'a@example.com', password: 'test' }); }}>Login</button>
    <button onClick={() => { void logout().catch(() => {}); }}>Logout</button></>;
}
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><AuthProvider><Consumer /></AuthProvider></QueryClientProvider>);
  return client;
}
beforeEach(() => vi.resetAllMocks());
describe('authoritative current-user query', () => {
  it('loads /me and refreshes it after login, then clears all private cache on logout', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);
    const client = setup();
    await screen.findByText('Guest');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(user);
    fireEvent.click(screen.getByText('Login'));
    await screen.findByText('User A');
    expect(client.getQueryData(CURRENT_USER_KEY)).toEqual(user);
    client.setQueryData(['sessions'], ['private']);
    fireEvent.click(screen.getByText('Logout'));
    await screen.findByText('Guest');
    expect(client.getQueryData(['sessions'])).toBeUndefined();
    expect(client.getQueryData(CURRENT_USER_KEY)).toBeNull();
  });
  it('becomes unauthenticated when /me returns an expired session', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(user);
    const client = setup(); await screen.findByText('User A');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);
    await act(async () => { await client.invalidateQueries({ queryKey: CURRENT_USER_KEY }); });
    await screen.findByText('Guest');
  });
  it('clears the current user immediately after a protected endpoint rejects the session', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(user);
    const client = setup(); await screen.findByText('User A');
    client.setQueryData(['sessions'], ['private']);
    act(() => { window.dispatchEvent(new Event('speedsight:unauthorized')); });
    await screen.findByText('Guest');
    expect(client.getQueryData(['sessions'])).toBeUndefined();
  });
  it('reports API failures and does not pretend failed logout succeeded', async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(new ApiError(503, 'UNAVAILABLE', 'Unavailable'));
    const client = setup(); await screen.findByText('Network error');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(user);
    await act(async () => { await client.invalidateQueries({ queryKey: CURRENT_USER_KEY }); });
    await screen.findByText('User A');
    vi.mocked(authApi.logout).mockRejectedValue(new Error('offline'));
    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => expect(authApi.logout).toHaveBeenCalled());
    expect(client.getQueryData(CURRENT_USER_KEY)).toEqual(user);
  });
});
