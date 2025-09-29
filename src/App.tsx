import { useEffect } from "react";
import Home from "./pages/home";
import { initializeThemeFromSystemPreference } from "./theme/initTheme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Settings from "./pages/settings";
import Info from "./pages/info";
import GrilleMenu from "./pages/grilleMenu";
import Houses from "./pages/houses";

function App() {
  useEffect(() => {
    initializeThemeFromSystemPreference();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/houses" element={<Houses />} />
        <Route path="/info" element={<Info />} />
        <Route path="/grille" element={<GrilleMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
