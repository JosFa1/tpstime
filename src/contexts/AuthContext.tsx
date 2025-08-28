import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TokenCache from '../utils/TokenCache';
import GoogleAuthService from '../services/GoogleAuthService';

interface User {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, name: string, picture?: string) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthRequired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Google OAuth is configured
  const isAuthRequired = Boolean(
    process.env.REACT_APP_GOOGLE_CLIENT_ID && 
    process.env.REACT_APP_GOOGLE_CLIENT_SECRET
  );

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthRequired) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // First check for cached OAuth tokens
      const cachedUser = TokenCache.getCachedUser();
      if (cachedUser && TokenCache.isValidCachedToken()) {
        setUser(cachedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Fallback to sessionStorage for backward compatibility
      const authState = sessionStorage.getItem('tpstimeAuthed');
      const userInfo = sessionStorage.getItem('tpstimeUser');
      
      if (authState === 'true' && userInfo) {
        try {
          const userData = JSON.parse(userInfo);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          sessionStorage.removeItem('tpstimeAuthed');
          sessionStorage.removeItem('tpstimeUser');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthRequired]);

  const login = (email: string, name: string, picture?: string) => {
    const userData = { email, name, picture };
    setUser(userData);
    setIsAuthenticated(true);
    
    // Store in both sessionStorage (for backward compatibility) and token cache
    sessionStorage.setItem('tpstimeAuthed', 'true');
    sessionStorage.setItem('tpstimeUser', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear both sessionStorage and token cache
    sessionStorage.removeItem('tpstimeAuthed');
    sessionStorage.removeItem('tpstimeUser');
    
    // Clear cached OAuth tokens
    TokenCache.clearTokens();
    
    // Sign out from Google service
    GoogleAuthService.getInstance().signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      isLoading,
      isAuthRequired 
    }}>
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
