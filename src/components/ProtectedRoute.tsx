import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [checkingToken, setCheckingToken] = useState(true);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Check for token in localStorage
    const hasToken = !!localStorage.getItem('accessToken');
    const hasUserEmail = !!localStorage.getItem('userEmail');
    
    // Consider locally authenticated if we have token and email
    setIsLocallyAuthenticated(hasToken && hasUserEmail);
    setCheckingToken(false);
  }, []); // Only check once on mount

  // Show loading while checking auth
  if (loading || checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-xl">Loading...</div>
      </div>
    );
  }

  // Use either context auth or local storage auth
  if (!isAuthenticated && !isLocallyAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
