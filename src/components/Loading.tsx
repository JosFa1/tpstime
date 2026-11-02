import React from 'react';
import './loading.css';

type Shape = 'timer' | 'schedule' | 'lightning' | 'settings' | 'houses' | 'page' | 'weekdays';

export function Skeleton({ shape, label = 'Loading…' }: { shape: Shape; label?: string }) {
  return <div className={`skeleton-layout skeleton-layout--${shape}`} role={label ? 'status' : undefined} aria-hidden={!label || undefined}>
    {label && <span className="sr-only">{label}</span>}
    <div aria-hidden="true">
      {shape === 'timer' ? <>
        <div className="skeleton-bar skeleton-caption" />
        <div className="skeleton-bar skeleton-timer" />
        <div className="skeleton-summary">{[0, 1, 2].map(i => <div key={i}><div className="skeleton-bar" /><div className="skeleton-bar" /></div>)}</div>
      </> : shape === 'weekdays' ? <div className="skeleton-weekdays">{[0, 1, 2, 3, 4].map(i => <div key={i} className="skeleton-bar" />)}</div>
      : shape === 'lightning' ? <><div className="skeleton-alert"><div className="skeleton-bar skeleton-icon" /><div className="skeleton-alert-copy"><div className="skeleton-bar" /><div className="skeleton-bar" /></div><div className="skeleton-bar skeleton-sensor" /></div><div className="skeleton-bar skeleton-body" /><div className="skeleton-bar skeleton-short" /></>
      : shape === 'settings' ? <>
        <div className="skeleton-bar skeleton-page-title" />
        <div className="skeleton-settings-body">
          <div className="skeleton-settings-nav">{[0, 1, 2].map(i => <div key={i} className="skeleton-bar" />)}</div>
          <div>
            <div className="skeleton-settings-options">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton-bar" />)}</div>
            <div className="skeleton-bar skeleton-theme-preview" />
            {[0, 1, 2].map(i => <div className="skeleton-row" key={i}><div className="skeleton-bar" /><div className="skeleton-bar" /></div>)}
          </div>
        </div>
      </>
      : <>{shape === 'houses' && <div className="skeleton-bar skeleton-page-title" />}{Array.from({ length: shape === 'houses' ? 6 : 5 }, (_, i) => <div className="skeleton-row" key={i}>{shape === 'houses' && <div className="skeleton-bar skeleton-house-logo" />}<div className="skeleton-bar" /><div className="skeleton-bar" /></div>)}</>}
    </div>
  </div>;
}

export function RequestError({ message, pending, retry, retained = false }: { message: string; pending: boolean; retry: () => void; retained?: boolean }) {
  return <div className="request-message" role="alert">
    <p>{retained ? `Showing the last loaded data. ${message}` : message}</p>
    <button type="button" onClick={retry} disabled={pending} aria-busy={pending}>{pending ? 'Retrying…' : 'Try again'}</button>
  </div>;
}

export function PageLoading({ label = 'Loading page…', pathname = '/' }: { label?: string; pathname?: string }) {
  const shape = pathname === '/' ? 'timer' : pathname === '/settings' ? 'settings' : pathname === '/houses' ? 'houses' : 'page';
  return <div className="page-loading" aria-busy="true">
    <div className="page-loading-header" aria-hidden="true"><div className="skeleton-bar" /><div className="skeleton-bar" /></div>
    <div className={`page-loading-content page-loading-content--${shape}`}><Skeleton shape={shape} label={label} /></div>
  </div>;
}

export class PageBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <main className="page-loading"><div className="request-message" role="alert"><h1>This page could not be loaded</h1><p>Check your connection and reload to try again.</p><button type="button" onClick={() => window.location.reload()}>Reload page</button></div></main> : this.props.children;
  }
}
