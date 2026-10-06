import React from 'react';
import { render, waitFor } from '@testing-library/react';
import OAuthCallback from './callback';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ login: mockLogin }) }));
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });

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
