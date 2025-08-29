import GoogleAuthService from '../services/GoogleAuthService';

/**
 * Utility functions for authentication
 */

export const isAuthRequired = (): boolean => {
  return Boolean(
    process.env.REACT_APP_GOOGLE_CLIENT_ID && 
    process.env.REACT_APP_GOOGLE_CLIENT_SECRET
  );
};

export const getCachedAuth = () => {
  if (!isAuthRequired()) return null;
  
  const googleAuthService = GoogleAuthService.getInstance();
  return googleAuthService.getCachedAuth();
};

export const clearAllAuth = () => {
  const googleAuthService = GoogleAuthService.getInstance();
  googleAuthService.clearCachedAuth();
  
  // Also clear session storage for backward compatibility
  sessionStorage.removeItem('tpstimeAuthed');
  sessionStorage.removeItem('tpstimeUser');
};

export {};
