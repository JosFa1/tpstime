import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const EXTENSION_ID = "kjjmokfjlgabfhkookiedbfhfdehgbcl";
const STORE_URL = `https://chromewebstore.google.com/detail/tpstime-extension/${EXTENSION_ID}`;
// Exposed to tpstime.com only, from extension 6.0.2 on.
const PROBE_URL = `chrome-extension://${EXTENSION_ID}/icons/icon16.png`;
// Amplify rewrites .mp4 requests to index.html, so the video comes from the public repo via jsDelivr.
const VIDEO_URL = "https://cdn.jsdelivr.net/gh/JosFa1/tpstime@ad0ac82/public/tpstime_launch.mp4";
// v2: the first release could not load the video, so show it once more.
const SEEN_KEY = "extensionPromoSeen2";

// Same check as HamburgerMenu: phones and tablets can't install Chrome extensions.
const isMobile = () =>
  window.matchMedia("(pointer: coarse)").matches || /Mobi|Android/i.test(navigator.userAgent);

// Kept in both localStorage and a cookie so logging out or clearing either one doesn't reshow it.
function hasSeen() {
  try {
    if (localStorage.getItem(SEEN_KEY) === "1") return true;
  } catch {}
  return document.cookie.split("; ").includes(`${SEEN_KEY}=1`);
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
  document.cookie = `${SEEN_KEY}=1; max-age=315360000; path=/; SameSite=Lax; Secure`;
}

const ExtensionPromo: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mobile] = useState(isMobile);
  const [installed, setInstalled] = useState(false);
  const [muted, setMuted] = useState(true);
  // Signed-in desktop users only, and never mid sign-in.
  const hidden = mobile || !isAuthenticated || pathname.startsWith("/auth/callback");

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    // Always start silent so it never blares in a classroom; sound is one click away.
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play()?.catch(() => {});
  };
  const close = () => dialogRef.current?.close();
  const toggleSound = () => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  useEffect(() => {
    if (hidden) return;
    if (!hasSeen()) open();
    markSeen();

    const probe = new Image();
    probe.onload = () => setInstalled(true);
    probe.src = PROBE_URL;
  }, [hidden]);

  if (hidden) return null;

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-label="TPSTime Extension"
        className="p-0 rounded-2xl border border-border bg-surface text-text shadow-2xl backdrop:bg-black/30"
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => videoRef.current?.pause()}
      >
        <div className="relative flex flex-col items-center gap-4 p-5">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute top-2 right-3 text-2xl leading-none text-text-secondary hover:text-text"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold">Get the TPSTime Extension</h2>
          <div className="relative">
            <video
              ref={videoRef}
              src={VIDEO_URL}
              muted
              playsInline
              controls
              preload="none"
              onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
              className="h-[65vh] max-h-[720px] aspect-[9/16] rounded-xl bg-black"
            />
            <button
              type="button"
              onClick={toggleSound}
              className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white hover:bg-black/80"
            >
              {muted ? "Turn on sound" : "Mute"}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="rounded-full bg-primary px-6 py-2 font-semibold text-background hover:opacity-90"
            >
              Install TPSTime Extension
            </a>
            <button type="button" onClick={close} className="px-4 py-2 text-text-secondary hover:underline">
              Skip
            </button>
          </div>
        </div>
      </dialog>
      {!installed && (
        <button
          type="button"
          onClick={open}
          // The theme's primary color with a ring offset from the page, so it pops on every theme.
          className="fixed bottom-5 right-5 z-40 rounded-full bg-primary px-5 py-3 font-semibold text-background shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background hover:opacity-90"
        >
          Get the extension
        </button>
      )}
    </>
  );
};

export default ExtensionPromo;
