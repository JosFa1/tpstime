import React, { useEffect, Suspense, lazy } from "react";
import { initializeThemeFromSystemPreference } from "./theme/initTheme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import OAuthCallback from './pages/auth/callback';

// Lazy load protected routes to prevent them from being included in the initial bundle
const Home = lazy(() => import("./pages/home"));
const Settings = lazy(() => import("./pages/settings"));
const Houses = lazy(() => import("./pages/houses"));
const Info = lazy(() => import("./pages/info"));
const GrilleMenu = lazy(() => import("./pages/grilleMenu"));

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-text text-xl">Loading...</div>
  </div>
);

function App() {
  useEffect(() => {
    initializeThemeFromSystemPreference();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/houses"
              element={
                <ProtectedRoute>
                  <Houses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/info"
              element={
                <ProtectedRoute>
                  <Info />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grille"
              element={
                <ProtectedRoute>
                  <GrilleMenu />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
