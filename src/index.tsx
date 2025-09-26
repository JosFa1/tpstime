import React from "react";
import { createRoot } from "react-dom/client"; // React 18 entry point
import "./index.css";
import "./styles/themes.css";

// Import WebSocket error handler to prevent development server crashes
import "./utils/websocketErrorHandler";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "./contexts/ThemeContext";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

const root = createRoot(container); // React 18 way

function AppWithAuth() {
  // Directly render the app, no authentication required
  return <App />;
}

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithAuth />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
