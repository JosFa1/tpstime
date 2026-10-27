import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock3, Cloud, Palette, Zap } from 'lucide-react';
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
    <div className="whats-new__header">
      <h1 id="whats-new-title">What's new in TPSTime v3</h1>
    </div>
    <div className="whats-new__cards">
      <article className="whats-new__card">
        <div className="whats-new__art whats-new__art--timer" aria-hidden="true"><Clock3 size={42} strokeWidth={1.7} /><CalendarDays size={36} strokeWidth={1.7} /></div>
        <h2><CalendarDays size={17} aria-hidden="true" /> Cleaner UI and Features</h2>
        <p>A refreshed timer and schedule, a mini timer, house rankings and history, and a redesigned Grille menu.</p>
      </article>
      <article className="whats-new__card">
        <div className="whats-new__art whats-new__art--lightning" aria-hidden="true"><Cloud size={42} strokeWidth={1.7} /><Zap size={36} strokeWidth={1.7} /></div>
        <h2><Zap size={17} aria-hidden="true" /> Lightning Alert</h2>
        <p>Select Lightning Alert at the top to check campus conditions.</p>
      </article>
      <article className="whats-new__card">
        <div className="whats-new__art whats-new__art--themes" aria-hidden="true"><span /><span /><span /><span /><Palette size={27} /></div>
        <h2><Palette size={17} aria-hidden="true" /> Settings</h2>
        <p>Open Menu &rarr; Settings to name your classes, choose a theme, and adjust your display.</p>
      </article>
    </div>
    <div className="whats-new__footer"><small>Made by Jason Wang</small><button type="button" onClick={dismiss}>Got it</button></div>
  </dialog>;
}
