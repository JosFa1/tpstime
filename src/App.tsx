import { useEffect } from "react";
import Home from "./pages/home";
import { initializeThemeFromSystemPreference } from "./theme/initTheme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Settings from "./pages/settings";
import Info from "./pages/info";
import GrilleMenu from "./pages/grilleMenu";
import LoginPageNew from "./pages/LoginPageNew";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  useEffect(() => {
    initializeThemeFromSystemPreference();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPageNew />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/info" element={
            <ProtectedRoute>
              <Info />
            </ProtectedRoute>
          } />
          <Route path="/grille" element={
            <ProtectedRoute>
              <GrilleMenu />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
