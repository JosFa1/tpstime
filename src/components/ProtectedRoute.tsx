import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { localPreview } from '../localPreview';
import { usePreferences } from '../preferences';

import { PageLoading } from './Loading';

const PageMiniTimer = lazy(() => import('./MiniTimer').then(module => ({ default: module.PageMiniTimer })));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const enableAuthEnv = process.env.REACT_APP_ENABLE_AUTH;
  const enableAuth = !(enableAuthEnv === 'false' || enableAuthEnv === '0');
  const [checkingToken, setCheckingToken] = useState(true);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const location = useLocation();
  const [prefs] = usePreferences();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('accessToken');
    const hasToken = !!token && !token.startsWith('mock_token_');
    const hasUserEmail = !!localStorage.getItem('userEmail');

    // Consider locally authenticated if we have token and email
    setIsLocallyAuthenticated(hasToken && hasUserEmail);
    setCheckingToken(false);
  }, []); // Only check once on mount

  // Show loading while checking auth
  if (loading || checkingToken) {
    return <PageLoading label="Checking sign-in…" pathname={location.pathname} />;
  }

  // If auth is disabled via env, allow access to all routes
  if (!enableAuth || localPreview) {
    return <>{children}{location.pathname !== '/' && prefs.showMiniTimer && <Suspense fallback={null}><PageMiniTimer /></Suspense>}</>;
  }

  // Use either context auth or local storage auth
  if (!isAuthenticated && !isLocallyAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}{location.pathname !== '/' && prefs.showMiniTimer && <Suspense fallback={null}><PageMiniTimer /></Suspense>}</>;
};

export default ProtectedRoute;
