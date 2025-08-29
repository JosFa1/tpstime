import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleAuthService from '../services/GoogleAuthService';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
  }, []);

  // Parse JWT token
  const parseJwt = (token: string): any => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  // Handle Google Auth response (for both mobile button and desktop)
  const handleGoogleResponse = useCallback((response: any) => {
    try {
      // Decode the JWT token
      const payload = parseJwt(response.credential);
      
      // Get the required email domain from environment variables, default to @trinityprep.org
      const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';
      
      // Check if email is from the required domain
      if (!payload.email.endsWith(requiredDomain)) {
        setError(`Please use your ${requiredDomain} Google account`);
        return;
      }

      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };

      // Save token to cache
      const googleAuthService = GoogleAuthService.getInstance();
      googleAuthService.saveAuthToCache(response.credential, user);

      login(payload.email, payload.name, payload.picture);
      navigate('/');
    } catch (error) {
      setError('Failed to process authentication response');
    }
  }, [login, navigate]);

  // Initialize Google Auth for mobile
  useEffect(() => {
    if (isMobile) {
      const initMobileAuth = async () => {
        const googleAuthService = GoogleAuthService.getInstance();
        const initialized = await googleAuthService.initializeForMobile(handleGoogleResponse);
        setIsGoogleInitialized(initialized);
        
        if (initialized) {
          // Render the Google Sign-In button for mobile
          setTimeout(() => {
            const buttonContainer = document.getElementById('google-signin-button');
            if (buttonContainer && window.google) {
              googleAuthService.renderSignInButton('google-signin-button');
            }
          }, 100);
        }
      };
      
      initMobileAuth();
    }
  }, [isMobile, handleGoogleResponse]);

  const handleGoogleSignIn = async () => {
    setError('');
    
    if (isMobile && isGoogleInitialized) {
      // For mobile, the button should handle the sign-in
      setError('Please use the Google Sign-In button below');
      return;
    }
    
    try {
      const googleAuthService = GoogleAuthService.getInstance();
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user) {
        login(result.user.email, result.user.name, result.user.picture);
        navigate('/');
      } else if (result.error === 'MOBILE_BUTTON_REQUIRED') {
        // This means we're on mobile and should use the button
        setError('Please use the Google Sign-In button below');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Google authentication is not available');
    }
  };

  // Get the required email domain for display, default to @trinityprep.org
  const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-text">
            Trinity Prep Schedule
          </h2>
          <p className="mt-2 text-sm text-text opacity-80">
            Please sign in with your {requiredDomain.replace('@', '')} Google account
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text mb-2">
                  Sign in to access your schedule
                </h3>
                <p className="text-sm text-text opacity-70 mb-4">
                  You must use your {requiredDomain} Google account
                </p>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center flex-col items-center space-y-4">
                {isMobile && isGoogleInitialized ? (
                  // Show Google's official button for mobile
                  <div id="google-signin-button" className="flex justify-center"></div>
                ) : (
                  // Show custom button for desktop
                  <button
                    onClick={handleGoogleSignIn}
                    className="bg-primary hover:bg-primary/90 text-background font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                )}
                
                {isMobile && !isGoogleInitialized && (
                  <div className="text-sm text-text opacity-70">
                    Loading Google Sign-In...
                  </div>
                )}
              </div>
              
              <div className="text-xs text-text opacity-60 text-center mt-4">
                Only {requiredDomain} accounts are allowed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
