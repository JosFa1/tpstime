import React, { useEffect, useRef, useState } from 'react';
import './WhatsNew.css';

const STORAGE_KEY = 'tpstime-thanksgiving-update-2026';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScnX3LXrbtjXRo_NWm9qK19_uno2X9UPpZhqU00G8hqN801dw/viewform?embedded=true';

export default function WhatsNew() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'seen'; } catch { return true; }
  });

  useEffect(() => {
    if (!visible || !dialog.current) return;
    dialog.current.showModal();
    try { localStorage.setItem(STORAGE_KEY, 'seen'); } catch { /* The prompt can appear again if storage is unavailable. */ }
  }, [visible]);

  function dismiss() {
    setVisible(false);
  }

  if (!visible) return null;
  return <dialog ref={dialog} className="whats-new" aria-labelledby="feedback-title" onClose={dismiss}>
    <header className="whats-new__header">
      <h1 id="feedback-title" tabIndex={-1} autoFocus>What’s new in TPSTime</h1>
      <p>A roomier clock, adjustable digit spacing in Settings → Display, and a new Thanksgiving theme. Prefer your usual look? Switch back anytime in Settings → Theme.</p>
      <h2>Share your feedback</h2>
      <p>Tell us what you think of the update and what you would like to see next.</p>
    </header>
    <iframe className="feedback-form" title="TPSTime feedback form" src={FORM_URL} />
    <div className="whats-new__footer"><a href={FORM_URL} target="_blank" rel="noopener noreferrer">Open form in a new tab</a><button type="button" onClick={dismiss}>Close</button></div>
  </dialog>;
}
