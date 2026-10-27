import React, { useEffect, useState } from "react";
import { ChevronDown } from 'lucide-react';
import LogButton from "../components/logButton";
import HamburgerMenu from "../components/HamburgerMenu";
import ThemeSwitcher from "../components/ThemeSwitcher";
import FooterNote from "../components/FooterNote";
import { usePreferences } from "../preferences";
import { useSchedule } from "../hooks/useSchedule";
import "./settings.css";
import { RequestError } from '../components/Loading';
import { localPreview } from '../localPreview';

function Settings() {
  const [prefs, setPrefs] = usePreferences();
  const { week, loading, error, refreshing, reload } = useSchedule();
  const [showProgressBar, setShowProgressBar] = useState(() => {
    const saved = localStorage.getItem("showProgressBar");
    return saved !== "false";
  });

  useEffect(() => {
    localStorage.setItem("showProgressBar", showProgressBar.toString());
    // notify other components in the same window
    try {
      window.dispatchEvent(new CustomEvent('showProgressBarChanged', { detail: showProgressBar }));
    } catch (e) {
      // ignore in environments where CustomEvent might fail
    }
  }, [showProgressBar]);

  return (
    <div className="text-text bg-background min-h-screen w-full flex flex-col relative">
      {/* Top bar: HamburgerMenu top right */}
      <div className="w-full flex flex-row justify-between items-center pt-4 pb-2 px-2 sm:px-4">
        <div />
        <div className="flex flex-row items-center gap-2">
          <HamburgerMenu />
        </div>
      </div>
      <main className="settings-layout">
        <header className="settings-title"><h1>Settings</h1></header>
        {error && <RequestError message={error} pending={refreshing} retry={reload} retained={Boolean(week)} />}
        <ThemeSwitcher themes={week?.themes ?? []} loading={loading} />
        {!localPreview && !loading && !error && week && !week.themes?.some(theme => theme.isEnabled) && <p className="settings-note">No school themes have been published. Your other themes are still available.</p>}

        <section className="settings-card settings-preferences">
          <div className="settings-section-heading"><h2>My classes</h2><p>Names are saved on this device.</p></div>
          <div className="settings-periods">{Object.entries(prefs.personalNames).map(([period, name]) => <label key={period}>Period {period}<input value={name} maxLength={40} placeholder={`Period ${period}`} onChange={e => setPrefs(p => ({ ...p, personalNames: { ...p.personalNames, [period]: e.target.value } }))} /></label>)}</div>
          <p className="settings-note">Leave a name blank to use the school's official label.</p>
        </section>

        <section className="settings-card settings-preferences">
          <div className="settings-section-heading"><h2>Display</h2></div>
          <label className="settings-row">Default tab <select value={prefs.defaultTab} onChange={e => setPrefs(p => ({ ...p, defaultTab: e.target.value as typeof p.defaultTab }))}><option value="timer">Timer</option><option value="schedule">Schedule</option><option value="lightning">Lightning Alert</option></select></label>
          <label className="settings-row">Show mini timer <input type="checkbox" checked={prefs.showMiniTimer} onChange={e => setPrefs(p => ({ ...p, showMiniTimer: e.target.checked }))} /></label>
          <label className="settings-row">Show progress bar <input type="checkbox" checked={showProgressBar} onChange={e => setShowProgressBar(e.target.checked)} /></label>
          <details className="settings-disclosure">
            <summary>Advanced display options <ChevronDown size={20} aria-hidden="true" /></summary>
            <label className="settings-row">Time format <select value={prefs.timeFormat} onChange={e => setPrefs(p => ({ ...p, timeFormat: e.target.value as '12h' | '24h' }))}><option value="12h">12 hour</option><option value="24h">24 hour</option></select></label>
            <label className="settings-row">Show seconds <input type="checkbox" checked={prefs.showSeconds} onChange={e => setPrefs(p => ({ ...p, showSeconds: e.target.checked }))} /></label>
            <label className="settings-row">Dyslexia-friendly font <input type="checkbox" checked={prefs.dyslexicFont} onChange={e => setPrefs(p => ({ ...p, dyslexicFont: e.target.checked }))} /></label>
            <label className="settings-row">Reduce motion <input type="checkbox" checked={prefs.reduceMotion} onChange={e => setPrefs(p => ({ ...p, reduceMotion: e.target.checked }))} /></label>
            <p className="settings-note">Your device's reduced-motion preference is always respected.</p>
          </details>
        </section>
        <div className="settings-signout"><LogButton /></div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col">
        <Settings />
      </div>
      <FooterNote />
    </div>
  );
}
