import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { adminApi, tokenStorage } from '../api';
vi.mock('../api', () => ({ adminApi: { login: vi.fn(), me: vi.fn() }, tokenStorage: { get: vi.fn(() => null), set: vi.fn(), remove: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
describe('administrator authentication', () => {
  it('starts unauthenticated and rejects failed server authentication', async () => {
    vi.mocked(adminApi.login).mockRejectedValue(new Error('unauthorized'));
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(false);
    await act(async () => { expect(await result.current.login('admin@example.invalid', 'wrong')).toBe(false); });
    expect(tokenStorage.set).not.toHaveBeenCalled();
  });
  it('uses server credentials, keeps a stable token getter, and clears state on logout', async () => {
    vi.mocked(adminApi.login).mockResolvedValue({ token: 'test-token', admin: { id: '1', email: 'admin@example.invalid' } });
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    const getter = result.current.getToken;
    await act(async () => { expect(await result.current.login('admin@example.invalid', 'password')).toBe(true); });
    expect(result.current.getToken).toBe(getter);
    expect(tokenStorage.set).toHaveBeenCalledWith('test-token');
    expect(result.current.isAuthenticated).toBe(true);
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false); expect(tokenStorage.remove).toHaveBeenCalled();
  });
  it('keeps weak-password sessions out of the administrator area', async () => {
    vi.mocked(adminApi.login).mockResolvedValue({ token: 'restricted-token', mustChangePassword: true, admin: { id: '1', email: 'admin@example.invalid' } });
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect(await result.current.login('admin@example.invalid', 'short')).toBe(true); });
    expect(result.current.mustChangePassword).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });
});

it('ends the administrator session after five minutes without interaction', async () => {
  vi.useFakeTimers();
  try {
    vi.mocked(adminApi.login).mockResolvedValue({ token: 'test-token', admin: { id: '1', email: 'admin@example.invalid' } });
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { await result.current.login('admin@example.invalid', 'fixture'); });
    act(() => { vi.advanceTimersByTime(4 * 60 * 1000); window.dispatchEvent(new Event('pointerdown')); });
    act(() => { vi.advanceTimersByTime(4 * 60 * 1000); });
    expect(result.current.isAuthenticated).toBe(true);
    act(() => { vi.advanceTimersByTime(60 * 1000); });
    expect(result.current.isAuthenticated).toBe(false); expect(tokenStorage.remove).toHaveBeenCalled();
  } finally { vi.useRealTimers(); }
});
