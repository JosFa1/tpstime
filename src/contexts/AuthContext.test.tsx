import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

let logout: () => void = () => {};
const Capture = () => {
  logout = useAuth().logout;
  return null;
};

describe('logout', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as jest.Mock;
  });

  it('revokes the session server-side and clears every stored identity value', () => {
    const keys = ['user', 'accessToken', 'refreshToken', 'userEmail', 'userName', 'userPicture', 'loginTimestamp'];
    keys.forEach(key => localStorage.setItem(key, key === 'user' ? '{"email":"a@trinityprep.org","name":"A"}' : 'x'));
    localStorage.setItem('accessToken', 'access-token');
    render(<AuthProvider><Capture /></AuthProvider>);

    act(() => logout());

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://bbeswtssigkglspkleyc.supabase.co/auth/v1/logout?scope=local');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer access-token');
    keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
  });

  it('still clears local state when there is no token to revoke', () => {
    localStorage.setItem('userEmail', 'a@trinityprep.org');
    render(<AuthProvider><Capture /></AuthProvider>);

    act(() => logout());

    expect(global.fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });
});
