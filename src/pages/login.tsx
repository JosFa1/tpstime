import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleAuthService from '../services/GoogleAuthService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';
  // Wifi help UI state
  const [showHelp, setShowHelp] = useState(false);
  const [wifiChecking, setWifiChecking] = useState(false);
  const [wifiError, setWifiError] = useState<string | null>(null);

  // If authentication is disabled via environment, skip login and go to home
  const enableAuthEnv = process.env.REACT_APP_ENABLE_AUTH;
  const enableAuth = !(enableAuthEnv === 'false' || enableAuthEnv === '0');

  // Optional WiFi check gate
  const enableWifiCheckEnv = process.env.REACT_APP_ENABLE_WIFI_CHECK;
  const enableWifiCheck = enableWifiCheckEnv === 'true' || enableWifiCheckEnv === '1';
  const wifiCheckUrl = process.env.REACT_APP_WIFI_CHECK_URL || '';

  useEffect(() => {
    if (!enableAuth) {
      // Auth disabled - redirect straight to home
      navigate('/', { replace: true });
      return;
    }

    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, enableAuth]);

  // If we arrive here after a failed auth attempt, surface the error and show help
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const urlError = params.get('error') || params.get('reason') || params.get('message');
      const storedError = localStorage.getItem('lastAuthError');
      if (urlError || storedError) {
        setError(decodeURIComponent(urlError || storedError || ''));
        setShowHelp(true);
        if (storedError) localStorage.removeItem('lastAuthError');
      }
    } catch {}
  }, [location.search]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    try {
      // This will redirect to Google's auth page
      GoogleAuthService.getInstance().signIn();
    } catch (err) {
      setLoading(false);
      setError('Failed to initiate sign-in process');
      console.error('Login error:', err);
    }
  };

  // Ping an intranet-only URL using an <img> to avoid CORS issues.
  const pingImage = (url: string, timeoutMs = 2500): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        let settled = false;
        const timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          try { img.src = ''; } catch {}
          reject(new Error('timeout'));
        }, timeoutMs);
        img.onload = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve();
        };
        img.onerror = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(new Error('error'));
        };
        // cache-buster
        img.src = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      } catch (e) {
        reject(e as Error);
      }
    });
  };

  const openTPStime = async () => {
    setWifiError(null);
    if (enableWifiCheck && wifiCheckUrl) {
      try {
        setWifiChecking(true);
        await pingImage(wifiCheckUrl, 3000);
        window.location.assign('http://tpstime.trinityprep.org');
      } catch (e) {
        setWifiError("We couldn't confirm you're on school WiFi. Please connect to an approved network below and try again.");
      } finally {
        setWifiChecking(false);
      }
      return;
    }
    // No check configured/enabled; proceed
    window.location.assign('http://tpstime.trinityprep.org');
  };

  const allowedSSIDs = ['US', 'US-new', 'MS', 'MS-new', 'Faculty'];
  const blockedSSIDs = ['Guest', 'Guest-new', 'Hotspots', 'Non-School wifi'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="w-full max-w-sm p-6 bg-surface rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Welcome to TPStime</h1>

        <div className="mt-2 text-center">
            <p className="text-sm font-bold text-red-500">Use your {requiredDomain} email.</p>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white font-semibold px-4 py-3 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {/* Optional: simple G icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>

        {/* Help: Issues logging in? */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowHelp((s) => !s)}
            className="text-sm text-primary hover:underline"
          >
            {showHelp ? 'Hide help' : "Can't sign in with Google?"}
          </button>
        </div>

        {showHelp && (
          <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
            <h2 className="text-lg font-semibold mb-2">Having trouble logging in?</h2>
            <p className="text-sm mb-3">If Google sign-in isn’t working, make sure you’re connected to a school Wi-Fi network. Then open TPStime directly.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-1">Connect to one of the following Wi‑Fis:</h3>
                <ul className="space-y-1">
                  {allowedSSIDs.map((ssid) => (
                    <li key={ssid} className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs">✓</span>
                      <span>{ssid}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">These will NOT work:</h3>
                <ul className="space-y-1">
                  {blockedSSIDs.map((ssid) => (
                    <li key={ssid} className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs">✕</span>
                      <span className="font-semibold">{ssid}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {wifiError && (
              <div className="mt-3 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 p-2 text-sm text-red-800 dark:text-red-200">
                {wifiError}
              </div>
            )}

            <button
              type="button"
              onClick={openTPStime}
              disabled={wifiChecking}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-white font-semibold px-4 py-2 hover:bg-secondary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {wifiChecking ? 'Checking Wi‑Fi…' : 'Open TPStime (tpstime.trinityprep.org)'}
            </button>

            {enableWifiCheck && !wifiCheckUrl && (
              <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                Wi‑Fi check is enabled, but no REACT_APP_WIFI_CHECK_URL is configured. The link will open without verification.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
