import React, { useEffect, useRef, useState } from 'react';
import './LightningWidget.css';
import { ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { Skeleton } from './Loading';

const API_URL = process.env.REACT_APP_LIGHTNING_API_URL || (process.env.NODE_ENV === 'development' ? '/api/lightning-alert' : 'https://bbeswtssigkglspkleyc.supabase.co/functions/v1/lightning-alert');
const SOURCE_URL = 'https://oas.earthnetworks.com/widget/ResOASWidget.html?widgetId=6d55256e-909d-461e-80a3-8f8ae8dcb635';
const FEED_URL = 'https://cdn-oas.api.earthnetworks.com/OASWidget.ashx?widgetId=6d55256e-909d-461e-80a3-8f8ae8dcb635&firstCall=1';
const POLL_MS = 30_000;
const TIMEOUT_MS = 10_000;

type Flash = { latitude: number; longitude: number; timeStampUtc: string; timeZone: string | null; countdownhours: number; countdownmins: number; countdownsecs: number };
type Feed = { Name?: string; manualAllClearMessage?: string; widgetData: { hasConnection?: string; closestFlash: Flash | null; ruleInfo: { latitude: number; longitude: number } | null; lxAlert: Flash & { hasAlerts: boolean; underManualAlert: boolean; underManualTestAlert: boolean; utilizeCountdownClock: boolean; statusText: string | null } } };
type Info = { site: string; connection: string; hasAlert: boolean; isTest: boolean; statusText: string | null; manualClear: string; clearAt: number | null; lastStrike: string | null; miles: number | null };

function parseFeed(text: string): Info {
  const [root] = JSON.parse(text.replace(/^\s*\(\s*'?/, '').replace(/'?\s*\)\s*;?\s*$/, '')) as [Feed];
  const { lxAlert: alert, closestFlash: flash, ruleInfo: rule } = root.widgetData;
  const src = flash ?? (alert.hasAlerts && !alert.underManualAlert ? alert : null);
  const clock = flash ?? (alert.underManualTestAlert && !alert.utilizeCountdownClock ? null : alert);
  const secs = clock ? clock.countdownhours * 3600 + clock.countdownmins * 60 + clock.countdownsecs : 0;
  let miles: number | null = null;
  if (alert.hasAlerts && src && rule) {
    const rad = Math.PI / 180;
    const x = (src.longitude - rule.longitude) * rad * Math.cos(((src.latitude + rule.latitude) / 2) * rad);
    miles = Math.hypot(x, (src.latitude - rule.latitude) * rad) * 3958.8;
  }
  return { site: root.Name ?? 'Trinity Prep', connection: root.widgetData.hasConnection ?? 'Not Set', hasAlert: Boolean(alert.hasAlerts), isTest: Boolean(alert.underManualTestAlert), statusText: alert.statusText ?? null, manualClear: root.manualAllClearMessage ?? '', clearAt: alert.hasAlerts && secs > 0 ? Date.now() + secs * 1000 : null, lastStrike: alert.hasAlerts && src ? `${src.timeStampUtc.replace('T', ' ')} ${src.timeZone ?? ''}`.trim() : null, miles };
}

function Countdown({ end }: { end: number }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const left = Math.max(0, Math.ceil((end - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return <div className="lightning-widget__clock" role="timer" aria-label="Estimated time to all clear">{[['Hours', Math.floor(left / 3600)], ['Minutes', Math.floor(left / 60) % 60], ['Seconds', left % 60]].map(([label, value]) => <div key={label}><strong>{pad(Number(value))}</strong><span>{label}</span></div>)}</div>;
}

export default function LightningWidget() {
  const [info, setInfo] = useState<Info | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [pending, setPending] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const retryPending = useRef(false);
  useEffect(() => {
    const lifecycle = new AbortController();
    let inFlight = false;
    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      setPending(true);
      const controller = new AbortController();
      const abortRequest = () => controller.abort();
      lifecycle.signal.addEventListener('abort', abortRequest, { once: true });
      const timeout = window.setTimeout(abortRequest, TIMEOUT_MS);
      try {
        const response = await fetch(API_URL, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next = parseFeed(await response.text());
        if (!lifecycle.signal.aborted) { setInfo(next); setFailed(false); setUpdatedAt(Date.now()); }
      } catch { if (!lifecycle.signal.aborted) setFailed(true); }
      finally {
        window.clearTimeout(timeout); lifecycle.signal.removeEventListener('abort', abortRequest);
        inFlight = false;
        if (!lifecycle.signal.aborted) { setPending(false); retryPending.current = false; }
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => { lifecycle.abort(); window.clearInterval(id); };
  }, [retry]);

  const tryAgain = () => {
    if (pending || retryPending.current) return;
    retryPending.current = true;
    setPending(true);
    setRetry(n => n + 1);
  };
  if (!info) return <div className="lightning-widget">{failed ? <div className="lightning-widget__state lightning-widget__state--error" role="alert"><strong>Lightning Alert could not be loaded</strong><span>Check your connection, or open the source for the latest information.</span><div><button type="button" disabled={pending} aria-busy={pending} onClick={tryAgain}><RefreshCw size={16} aria-hidden="true" /> {pending ? 'Retrying…' : 'Retry'}</button><a href={SOURCE_URL} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" /> Open source</a></div><iframe className="lightning-widget__official" title="Official campus Lightning Alert" src={SOURCE_URL} referrerPolicy="no-referrer" /></div> : <Skeleton shape="lightning" label="Loading Lightning Alert…" />}</div>;
  const tone = info.isTest ? 'test' : info.hasAlert ? 'alert' : 'clear';
  const label = info.isTest ? info.statusText ?? 'Test alert' : info.hasAlert ? 'Active alert' : 'No alert';
  return <div className="lightning-widget lightning-widget--live" aria-label="Lightning Alert"><div className={`lightning-widget__status lightning-widget__status--${tone}`} role="status"><Zap size={24} aria-hidden="true" /><div><strong>{failed ? `Last reported: ${label}` : label}</strong><span>{info.site}</span></div><em className={info.connection === 'Up' ? 'is-up' : 'is-down'}>{info.connection === 'Up' ? 'Sensor online' : `Sensor ${info.connection.toLowerCase()}`}</em></div>{info.hasAlert ? <><h4>Estimated time to all clear</h4>{info.clearAt ? <Countdown end={info.clearAt} /> : <p>{info.manualClear || 'Waiting for all clear'}</p>}<dl><div><dt>Last strike</dt><dd>{info.lastStrike ?? '--'}</dd></div><div><dt>Distance</dt><dd>{info.miles === null ? '--' : `${info.miles.toFixed(1)} mi`}</dd></div></dl></> : <p>{failed || info.connection !== 'Up' ? 'Current lightning conditions could not be verified. Check the source for updates.' : 'No lightning detected near campus.'}</p>}{failed && <div className="lightning-widget__stale" role="status"><p>Showing last update — connection interrupted.</p><button type="button" disabled={pending} aria-busy={pending} onClick={tryAgain}>{pending ? 'Reconnecting…' : 'Retry'}</button></div>}{updatedAt && <p className="lightning-widget__updated">Last updated {new Date(updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</p>}<a className="lightning-widget__source" href={SOURCE_URL} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" /> Source</a></div>;
}

export { API_URL as LIGHTNING_API_URL, FEED_URL as LIGHTNING_FEED_URL };
