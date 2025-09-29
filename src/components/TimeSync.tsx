import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const TimeSync: React.FC = () => {
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const t0 = performance.now();
        const data = await apiFetch<{ serverTime: string }>('/api/time');
        const t1 = performance.now();
        const rtt = (t1 - t0) / 1000; // in seconds
        setAccuracy(rtt / 2); // ± half the round-trip time

        const serverTimeDate = new Date(data.serverTime);
        setServerTime(serverTimeDate);
        console.log(
          `[TimeSync] Sync successful. Accuracy: ±${(rtt / 2).toFixed(3)} seconds.`
        );
      } catch (err: any) {
        setError(err.message);
        console.log('[TimeSync] Sync failed.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerTime();
  }, []);

  useEffect(() => {
    if (!serverTime) return;

    const interval = setInterval(() => {
      setServerTime((prevTime) => {
        if (!prevTime) return null;
        return new Date(prevTime.getTime() + 1000); // Increment by 1 second
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [serverTime]);

  if (loading) return <div className="text-xs text-gray-400">Loading server time...</div>;
  if (error) return <div className="text-xs text-gray-400">Error: {error}</div>;

  return (
    <div>
      {accuracy !== null && (
        <div className="text-xs text-gray-400 mt-1">
          Accuracy of synchronization: &plusmn;{accuracy.toFixed(3)} seconds
        </div>
      )}
    </div>
  );
};

export default TimeSync;
