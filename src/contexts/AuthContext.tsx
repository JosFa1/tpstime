import React, { createContext, useContext, useState, useEffect } from 'react';
import { PUBLISHABLE_KEY, SUPABASE_URL } from '../hooks/useSchedule';

interface User {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    // Sessions from the removed mock sign-in were never verified.
    if (accessToken?.startsWith('mock_token_')) {
      ['user', 'accessToken', 'userEmail', 'userName', 'userPicture'].forEach(key => localStorage.removeItem(key));
    } else if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    const accessToken = localStorage.getItem('accessToken');
    // Revoke the session on the server too, so a copied refresh token stops working.
    if (accessToken) {
      fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: 'POST',
        headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}` },
        keepalive: true,
      }).catch(() => {});
    }
    setUser(null);
    ['user', 'accessToken', 'refreshToken', 'userEmail', 'userName', 'userPicture', 'loginTimestamp']
      .forEach(key => localStorage.removeItem(key));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
