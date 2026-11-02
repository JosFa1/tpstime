import React, { useEffect, useState } from "react";
import { ClassPeriod } from "../types/classPeriod";
import { getScheduleStatus } from "../hooks/scheduleStatus";
import { formatClockParts } from "../hooks/formatClockParts";

type ClockProps = {
  schedule: ClassPeriod[];
  showSeconds?: boolean;
};

const Clock: React.FC<ClockProps> = ({ schedule, showSeconds = true }) => {
  const [status, setStatus] = useState(() => getScheduleStatus(schedule));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getScheduleStatus(schedule));
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule]);

  const { leftSide, middleSide, rightSide } = formatClockParts(status.secondsUntilNext);
  const display = showSeconds ? `${leftSide}:${middleSide ? `${middleSide}:` : ""}${rightSide}` : `${leftSide}${middleSide ? `:${middleSide}` : ""}`;

  return (
    <div className="timer-clock">
      {status.isDayOver ? null : (
        <p className={`timer-digits ${display.length > 5 ? 'timer-digits--long' : ''}`}>{display}</p>
      )}
    </div>
  );
};

export default Clock;
