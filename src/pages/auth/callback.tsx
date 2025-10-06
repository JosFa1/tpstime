import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GoogleAuthService from '../../services/GoogleAuthService';
import { extractTokenFromUrl, exchangeCodeForToken } from '../../utils/auth';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(true);
  const hasProcessed = useRef(false); // Prevent double processing

  useEffect(() => {
    // Prevent running multiple times
    if (hasProcessed.current) {
      return;
    }
    
    const handleCallback = async () => {
      console.log('Processing OAuth callback');
      hasProcessed.current = true;
      setProcessingAuth(true);
      
      try {
        // Check URL for code or token
        const query = new URLSearchParams(window.location.search);
        const code = query.get('code');
        
        if (code) {
          console.log('Found authorization code, exchanging for token');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Exchange code for token
          const token = await exchangeCodeForToken(code);
          if (!token) {
            setError('Failed to exchange authorization code for token');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
          
          // Process the token
          const authService = GoogleAuthService.getInstance();
          const result = await authService.handleRedirectResponse(token);
          
          if (result.success && result.user) {
            console.log('Authentication successful, redirecting to home');
            login(result.user);
            // Use a slight delay to ensure state is updated
            setTimeout(() => navigate('/', { replace: true }), 100);
          } else {
            setError(result.error || 'Authentication failed');
            setTimeout(() => navigate('/login'), 3000);
          }
          return;
        }
        
        // If no code, check for token in fragment
        const { accessToken, error: urlError } = extractTokenFromUrl();
        
        if (urlError) {
          console.error('Authentication error from URL:', urlError);
          setError(`Authentication error: ${urlError}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        if (!accessToken) {
          console.log('No token found - checking localStorage for recent auth');
          // Check if we have a token in localStorage already (from a previous auth)
          const storedToken = localStorage.getItem('accessToken');
          if (storedToken) {
            console.log('Found stored token, attempting to use it');
            const authService = GoogleAuthService.getInstance();
            const result = await authService.handleRedirectResponse(storedToken);
            
            if (result.success && result.user) {
              console.log('Successfully authenticated with stored token');
              login(result.user);
              // Use a slight delay to ensure state is updated
              setTimeout(() => navigate('/', { replace: true }), 100);
              return;
            }
          }
          
          setError('Authentication failed - no access token received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        console.log('Found access token, processing...');
        const authService = GoogleAuthService.getInstance();
        const result = await authService.handleRedirectResponse(accessToken);
        
        if (result.success && result.user) {
          console.log('Authentication successful, redirecting to home');
          login(result.user);
          // Use a slight delay to ensure state is updated
          setTimeout(() => navigate('/', { replace: true }), 100);
        } else {
          setError(result.error || 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred during authentication');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setProcessingAuth(false);
      }
    };
    
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  if (processingAuth || !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-text">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 rounded-md p-4 max-w-md">
        <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Authentication Error</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <p className="mt-2 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
