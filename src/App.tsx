import React, { useEffect, Suspense, lazy } from "react";
import { initializeThemeFromSystemPreference } from "./theme/initTheme";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import OAuthCallback from './pages/auth/callback';
import ExtensionPromo from "./components/ExtensionPromo";
import { usePreferences } from './preferences';
import { PageBoundary, PageLoading } from './components/Loading';
import { localPreview } from './localPreview';

// Lazy load protected routes to prevent them from being included in the initial bundle
const Home = lazy(() => import("./pages/home"));
const Settings = lazy(() => import("./pages/settings"));
const Houses = lazy(() => import("./pages/houses"));
const Info = lazy(() => import("./pages/info"));
const GrilleMenu = lazy(() => import("./pages/grilleMenu"));

function RouteBoundary({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return <PageBoundary key={pathname}><Suspense fallback={<PageLoading pathname={pathname} />}>{children}</Suspense></PageBoundary>;
}

function App() {
  const [preferences] = usePreferences();
  useEffect(() => {
    document.documentElement.style.setProperty('--clock-spacing', `${preferences.clockSpacing / 100}em`);
  }, [preferences.clockSpacing]);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-dyslexic-font', preferences.dyslexicFont);
  }, [preferences.dyslexicFont]);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-motion', preferences.reduceMotion);
  }, [preferences.reduceMotion]);
  useEffect(() => {
    initializeThemeFromSystemPreference();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {localPreview && <div className="demo-notice">Local demo — example schedule, not published school data.</div>}
        <RouteBoundary>
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
        </RouteBoundary>
        <ExtensionPromo />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
