import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const EXTENSION_ID = "kjjmokfjlgabfhkookiedbfhfdehgbcl";
const STORE_URL = `https://chromewebstore.google.com/detail/tpstime-extension/${EXTENSION_ID}`;
const PROBE_URL = `chrome-extension://${EXTENSION_ID}/icons/icon16.png`;
const isMobile = () => window.matchMedia("(pointer: coarse)").matches || /Mobi|Android/i.test(navigator.userAgent);

const ExtensionPromo: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [mobile] = useState(isMobile);
  const [installed, setInstalled] = useState(false);
  const hidden = mobile || !isAuthenticated || pathname.startsWith("/auth/callback");

  useEffect(() => {
    if (hidden) return;
    const probe = new Image();
    probe.onload = () => setInstalled(true);
    probe.src = PROBE_URL;
  }, [hidden]);

  if (hidden || installed) return null;
  return <a href={STORE_URL} target="_blank" rel="noopener noreferrer"
    className="fixed bottom-5 left-5 z-40 rounded-full bg-primary px-5 py-3 font-semibold text-background shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background hover:opacity-90">
    Get the extension
  </a>;
};

export default ExtensionPromo;
