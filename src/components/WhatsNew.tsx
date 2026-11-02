import React, { useEffect, useRef, useState } from 'react';
import './WhatsNew.css';

const STORAGE_KEY = 'tpstime-whats-new-redesign-2026';

export default function WhatsNew() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'seen'; } catch { return true; }
  });

  useEffect(() => {
    if (visible) dialog.current?.showModal();
  }, [visible]);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, 'seen'); } catch { /* The announcement can appear again if storage is unavailable. */ }
    setVisible(false);
  }

  if (!visible) return null;
  return <dialog ref={dialog} className="whats-new" aria-labelledby="whats-new-title" onClose={dismiss}>
    <header className="whats-new__header">
      <h1 id="whats-new-title" tabIndex={-1} autoFocus>What's new in TPSTime</h1>
      <p>Version 3</p>
    </header>
    <ul className="whats-new__updates">
      <li>
        <h2>Timer &amp; schedule</h2>
        <p>A refreshed daily view, with a mini timer.</p>
      </li>
      <li>
        <h2>Lightning Alert</h2>
        <p>Check campus conditions from the Lightning Alert tab.</p>
      </li>
      <li>
        <h2>House standings &amp; Grille</h2>
        <p>House rankings and points history, plus a clearer Grille menu.</p>
      </li>
      <li>
        <h2>Settings</h2>
        <p>Edit class names, themes and display in Menu &rarr; Settings.</p>
      </li>
    </ul>
    <div className="whats-new__footer"><small>Made by Jason Wang</small><button type="button" onClick={dismiss}>Got it</button></div>
  </dialog>;
}
