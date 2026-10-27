import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export type Preferences = {
  personalNames: Record<string, string>;
  timeFormat: '12h' | '24h';
  showSeconds: boolean;
  showMiniTimer: boolean;
  dyslexicFont: boolean;
  reduceMotion: boolean;
  defaultTab: 'timer' | 'schedule' | 'lightning';
};

const KEY = 'tpstimePreferences';
const defaults: Preferences = { personalNames: Object.fromEntries(['1','2','3','4','5','6','7'].map(p => [p, ''])), timeFormat: '12h', showSeconds: true, showMiniTimer: true, dyslexicFont: false, reduceMotion: false, defaultTab: 'timer' };

function read(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    const names = value.personalNames && typeof value.personalNames === 'object' && !Array.isArray(value.personalNames) ? value.personalNames : {};
    const personalNames = { ...defaults.personalNames };
    for (const period of Object.keys(personalNames)) personalNames[period] = typeof names[period] === 'string' ? names[period].slice(0, 40) : '';
    return { personalNames, timeFormat: value.timeFormat === '24h' ? '24h' : '12h', showSeconds: typeof value.showSeconds === 'boolean' ? value.showSeconds : true, showMiniTimer: value.showMiniTimer !== false, dyslexicFont: value.dyslexicFont === true, reduceMotion: value.reduceMotion === true, defaultTab: ['timer','schedule','lightning'].includes(value.defaultTab) ? value.defaultTab : 'timer' };
  } catch { return defaults; }
}

export function usePreferences(): [Preferences, Dispatch<SetStateAction<Preferences>>] {
  const [prefs, setPrefs] = useState<Preferences>(read);
  const current = useRef(prefs);
  current.current = prefs;
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* storage can be unavailable */ }
    window.dispatchEvent(new Event('tpstimePreferencesChanged'));
  }, [prefs]);
  useEffect(() => {
    const sync = () => {
      const next = read();
      if (JSON.stringify(next) !== JSON.stringify(current.current)) setPrefs(next);
    };
    window.addEventListener('storage', sync);
    window.addEventListener('tpstimePreferencesChanged', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('tpstimePreferencesChanged', sync); };
  }, []);
  return [prefs, setPrefs];
}
