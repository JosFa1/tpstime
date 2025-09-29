import React, { useEffect, useState } from "react";
import { ClassPeriod } from "../types/classPeriod";
import { getScheduleStatus } from "../hooks/scheduleStatus";
import { formatClockParts } from "../hooks/formatClockParts";
import { apiFetch } from "../utils/api";

type ClockProps = {
  schedule: ClassPeriod[];
};

const Clock: React.FC<ClockProps> = ({ schedule }) => {
  const [status, setStatus] = useState(() => getScheduleStatus(schedule));
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [serverTimeOffset, setServerTimeOffset] = useState<number | null>(null);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const t0 = performance.now();
        const data = await apiFetch<{ serverTime: string }>("/api/time");
        const t1 = performance.now();
        const serverTime = new Date(data.serverTime);
        const roundTripTime = (t1 - t0) / 1000; // in seconds
        const estimatedServerTime = new Date(serverTime.getTime() + roundTripTime * 500);
        setServerTimeOffset(estimatedServerTime.getTime() - Date.now());
      } catch (err) {
        console.error("[Clock] Failed to sync with server time:", err);
        setServerTimeOffset(null); // Fallback to device clock
      }
    };

    fetchServerTime();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const now = new Date();
        if (serverTimeOffset !== null) {
          return new Date(now.getTime() + serverTimeOffset);
        }
        return now; // Fallback to device clock
      });
      setStatus(getScheduleStatus(schedule));
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule, serverTimeOffset]);

  const { leftSide, rightSide } = formatClockParts(status.secondsUntilNext);

  return (
    <div className="flex flex-col items-start justify-center space-y-1 font-mono">
      {status.isDayOver ? null : (
        <p
          className={`text-[25vw] md:text-[20vw] w-full font-bold text-center leading-none text-primary`}
        >
          {leftSide}:{rightSide}
        </p>
      )}
    </div>
  );
};

export default Clock;
