import React from 'react';
import { render, waitFor } from '@testing-library/react';
import OAuthCallback from './callback';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ login: mockLogin }) }));
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });
const mockSignIn = jest.fn();
jest.mock('../../services/GoogleAuthService', () => ({
  __esModule: true,
  default: { getInstance: () => ({ signIn: mockSignIn }) },
}));

describe('website flow lost to another tab or profile', () => {
  const lostUrl = `/auth/callback/#state=website_${'a'.repeat(43)}&id_token=google.signed.token`;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockSignIn.mockReset();
    mockLogin.mockClear();
  });
  afterEach(() => window.history.replaceState({}, '', '/'));

  it('restarts Google sign-in once from this tab', async () => {
    window.history.replaceState({}, '', lostUrl);
    render(<OAuthCallback />);
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows the error instead of looping when the restarted flow is lost too', async () => {
    sessionStorage.setItem('tpstime.website.google-retry', '1');
    window.history.replaceState({}, '', lostUrl);
    const { findByText } = render(<OAuthCallback />);
    await findByText(/Start Google sign-in again/);
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(localStorage.getItem('lastAuthError')).toMatch(/Start Google sign-in again/);
    expect(sessionStorage.getItem('tpstime.website.google-retry')).toBeNull();
  });
});

describe('legacy callback paths', () => {
  const previousFetch = global.fetch;
  beforeEach(() => {
    localStorage.clear();
    mockLogin.mockClear();
    global.fetch = jest.fn();
  });
  afterEach(() => {
    global.fetch = previousFetch;
    window.history.replaceState({}, '', '/');
  });

  it.each([
    '/auth/callback/?code=x',
    '/auth/callback/#access_token=forged&token_type=bearer',
    '/auth/callback/#access_token=e30.eyJlbWFpbCI6ImFAdHJpbml0eXByZXAub3JnIn0.x',
  ])('never signs in from %s', async (url) => {
    window.history.replaceState({}, '', url);
    localStorage.setItem('accessToken', 'mock_token_old');
    const { findByText } = render(<OAuthCallback />);
    await findByText(/could not be verified/);
    await waitFor(() => expect(mockLogin).not.toHaveBeenCalled());
    expect(global.fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });
});
