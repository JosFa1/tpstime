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
import { revealExpandedDetails } from '../components/settingsDisclosure';

function Settings() {
  const [prefs, setPrefs] = usePreferences();
  const [category, setCategory] = useState('Theme');
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
    <div className="settings-shell text-text bg-background w-full flex flex-col relative">
      <div className="settings-topbar"><HamburgerMenu /></div>
      <main className="settings-layout">
        <header className="settings-title"><h1>Settings</h1></header>
        {error && <RequestError message={error} pending={refreshing} retry={reload} retained={Boolean(week)} />}
        <div className="settings-body">
          <nav className="settings-nav" aria-label="Settings categories">
            {['Theme', 'My classes', 'Display'].map((label, index) => <button key={label} type="button" aria-pressed={category === label} aria-controls={`settings-category-${index}`} onClick={() => setCategory(label)}>{label}</button>)}
            <div className="settings-signout"><LogButton /></div>
          </nav>
          <div className="settings-content">
            <div id="settings-category-0" hidden={category !== 'Theme'}>
              <ThemeSwitcher themes={week?.themes ?? []} loading={loading} />
              {!localPreview && !loading && !error && week && !week.themes?.some(theme => theme.isEnabled) && <p className="settings-note">No school themes have been published. Your other themes are still available.</p>}
            </div>

            <section id="settings-category-1" hidden={category !== 'My classes'} className="settings-section settings-preferences">
              <div className="settings-section-heading"><h2>My classes</h2></div>
              <div className="settings-periods">{Object.entries(prefs.personalNames).map(([period, name]) => <label key={period}>Period {period}<span className="settings-input"><input value={name} maxLength={40} placeholder={`Period ${period}`} onChange={e => setPrefs(p => ({ ...p, personalNames: { ...p.personalNames, [period]: e.target.value } }))} /></span></label>)}</div>
            </section>

            <section id="settings-category-2" hidden={category !== 'Display'} className="settings-section settings-preferences">
              <div className="settings-section-heading"><h2>Display</h2></div>
              <label className="settings-row">Default tab <span className="settings-select"><select value={prefs.defaultTab} onChange={e => setPrefs(p => ({ ...p, defaultTab: e.target.value as typeof p.defaultTab }))}><option value="timer">Timer</option><option value="schedule">Schedule</option><option value="lightning">Lightning Alert</option></select><ChevronDown size={18} aria-hidden="true" /></span></label>
              <div className="clock-spacing-control">
                <label className="settings-row" htmlFor="clock-spacing">Clock text spacing <output htmlFor="clock-spacing">{prefs.clockSpacing}%</output></label>
                <input id="clock-spacing" type="range" min="0" max="12" step="1" value={prefs.clockSpacing} aria-describedby="clock-spacing-help" aria-valuetext={`${prefs.clockSpacing}%`} onChange={e => setPrefs(p => ({ ...p, clockSpacing: Number(e.target.value) }))} />
                <p id="clock-spacing-help" className="settings-note">Adjust the space between timer digits. Saved automatically.</p>
                <div className="clock-spacing-preview" aria-label="Clock spacing preview" style={{ letterSpacing: `${prefs.clockSpacing / 100}em` }}>12:34:56</div>
              </div>
              <label className="settings-row">Show mini timer <input type="checkbox" checked={prefs.showMiniTimer} onChange={e => setPrefs(p => ({ ...p, showMiniTimer: e.target.checked }))} /></label>
              <label className="settings-row">Show progress bar <input type="checkbox" checked={showProgressBar} onChange={e => setShowProgressBar(e.target.checked)} /></label>
              <details className="settings-disclosure" onToggle={revealExpandedDetails}>
                <summary>Advanced display options <ChevronDown size={20} aria-hidden="true" /></summary>
                <label className="settings-row">Time format <span className="settings-select"><select value={prefs.timeFormat} onChange={e => setPrefs(p => ({ ...p, timeFormat: e.target.value as '12h' | '24h' }))}><option value="12h">12 hour</option><option value="24h">24 hour</option></select><ChevronDown size={18} aria-hidden="true" /></span></label>
                <label className="settings-row">Show seconds <input type="checkbox" checked={prefs.showSeconds} onChange={e => setPrefs(p => ({ ...p, showSeconds: e.target.checked }))} /></label>
                <label className="settings-row">Dyslexia-friendly font <input type="checkbox" checked={prefs.dyslexicFont} onChange={e => setPrefs(p => ({ ...p, dyslexicFont: e.target.checked }))} /></label>
                <label className="settings-row">Reduce motion <input type="checkbox" checked={prefs.reduceMotion} onChange={e => setPrefs(p => ({ ...p, reduceMotion: e.target.checked }))} /></label>
              </details>
            </section>
          </div>
        </div>
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
