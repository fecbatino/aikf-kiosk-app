import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';

// In the test environment VITE_ADMIN_PIN is not loaded from .env.development,
// so config.adminPin falls back to '0000'.
const TEST_PIN = '0000';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <AuthProvider>{children}</AuthProvider>
  </SettingsProvider>
);

describe('AuthContext', () => {
  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('allows successful login with correct PIN', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders });
    act(() => {
      const success = result.current.login(TEST_PIN);
      expect(success).toBe(true);
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('denies login with incorrect PIN', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders });
    act(() => {
      const success = result.current.login('9999');
      expect(success).toBe(false);
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('allows logout after login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders });
    act(() => { result.current.login(TEST_PIN); });
    expect(result.current.isAuthenticated).toBe(true);
    act(() => { result.current.logout(); });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
