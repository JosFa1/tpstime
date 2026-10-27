import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { RequestError } from './Loading';

const HouseHistory = lazy(() => import('./HouseHistory'));

function HistoryLoader() {
  const { week, loading, error, refreshing, reload } = useSchedule(true, true);
  if (loading) return <p className="settings-note">Loading points history...</p>;
  if (error) return <RequestError message={error} pending={refreshing} retry={reload} retained={Boolean(week)} />;
  return <Suspense fallback={<p className="settings-note">Loading points history...</p>}><HouseHistory history={week?.housePointsHistory} /></Suspense>;
}

export default function DeferredHouseHistory() {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} style={{ minHeight: visible ? undefined : 200 }}>{visible && <HistoryLoader />}</div>;
}
