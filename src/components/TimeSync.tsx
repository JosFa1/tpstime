import React, { useEffect, useState } from 'react';
// Shared API utilities for contacting the backend
import { apiFetch } from '../utils/api';

// Environment variable gate to toggle server time synchronization
const enableTimeSync = process.env.REACT_APP_ENABLE_TIMESYNC === 'true';

const TimeSync: React.FC = () => {
  // The time as reported (and corrected) from the server
  const [serverTime, setServerTime] = useState<string | null>(null);
  // Estimated accuracy (± seconds) of the synchronization
  const [accuracy, setAccuracy] = useState<number | null>(null);
  // Track whether the request is still pending
  const [loading, setLoading] = useState(true);
  // Store any error message that occurs while fetching time
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enableTimeSync) {
      setServerTime(new Date().toLocaleString());
      setLoading(false);
      console.log('[TimeSync] Time sync disabled, using system clock.');
      return;
    }
    const fetchServerTime = async () => {
      try {
        const t0 = performance.now();
        // Request current time from the backend server
        const data = await apiFetch<{ serverTime: string }>(`/api/time`);
        const t1 = performance.now();
        const rtt = (t1 - t0) / 1000; // in seconds
        // Estimate server time by adding half of the round-trip time
        const estimatedServerTime = new Date(
          new Date(data.serverTime).getTime() + rtt * 500
        );
        setServerTime(estimatedServerTime.toLocaleString());
        setAccuracy(rtt / 2); // ± half the round-trip time
        console.log(
          `[TimeSync] Sync successful. Accuracy: ±${(rtt / 2).toFixed(3)} seconds.`
        );
      } catch (err: any) {
        // On failure we log and fall back to the system clock
        setError(err.message);
        console.log('[TimeSync] Sync failed, using system clock.', err);
      } finally {
        // Signal completion regardless of success or failure
        setLoading(false);
      }
    };
    fetchServerTime();
  }, []);

  if (loading) return <div className="text-xs text-gray-400">Loading server time...</div>;
  if (!enableTimeSync) {
    return null;
  }
  if (error) return (
    <div className="text-xs text-gray-400">Using system clock.</div>
  );
  return (
    <div>
      {accuracy !== null && (
        <div className="text-xs text-gray-400 mt-1">Accuracy of synchronization: &plusmn;{accuracy.toFixed(3)} seconds</div>
      )}
    </div>
  );
};

export default TimeSync;
