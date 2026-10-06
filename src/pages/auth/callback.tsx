import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { buildTimePSOAuthRelayUrl, exchangeTimePSIdToken } from '../../utils/timepsOAuthRelay';
import { finishWebsiteGoogleSignIn, WebsiteFlowLostError } from '../../utils/websiteOAuth';
import GoogleAuthService from '../../services/GoogleAuthService';

const RETRY_KEY = 'tpstime.website.google-retry';

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
        const websiteUser = await finishWebsiteGoogleSignIn();
        if (websiteUser) {
          sessionStorage.removeItem(RETRY_KEY);
          login(websiteUser);
          navigate('/', { replace: true });
          return;
        }
        const timepsRelay = await exchangeTimePSIdToken(window.location.hash) ||
          buildTimePSOAuthRelayUrl(window.location.search);
        if (timepsRelay) {
          window.location.replace(timepsRelay);
          return;
        }
        // Only verified server-side flows can sign in. Raw codes or tokens are never trusted here.
        const msg = 'Sign-in could not be verified. Start Google sign-in again.';
        setError(msg);
        try { localStorage.setItem('lastAuthError', msg); } catch {}
        setTimeout(() => navigate('/login?error=1'), 3000);
      } catch (err) {
        // Google returned to a tab or profile that never started this flow. Restart once from here;
        // the user is now signed into Google in this context, so the second pass completes.
        if (err instanceof WebsiteFlowLostError && !sessionStorage.getItem(RETRY_KEY)) {
          sessionStorage.setItem(RETRY_KEY, '1');
          try {
            await GoogleAuthService.getInstance().signIn();
            return;
          } catch {}
        }
        sessionStorage.removeItem(RETRY_KEY);
        console.error('OAuth callback error:', err);
        const msg = err instanceof Error && err.message ? err.message : 'An unexpected error occurred during authentication';
        setError(msg);
        try { localStorage.setItem('lastAuthError', msg); } catch {}
        setTimeout(() => navigate('/login?error=1'), 3000);
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
