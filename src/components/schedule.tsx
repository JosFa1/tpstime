import React, { useEffect, useState } from "react";
import { ClassPeriod } from "../types/classPeriod";
import { convertTo12Hour } from "../utils/utils";
import { getScheduleStatus } from "../hooks/scheduleStatus";

type ScheduleProps = {
  schedule: ClassPeriod[];
  timeFormat?: "12h" | "24h";
  compact?: boolean;
  highlightActive?: boolean;
};

const Schedule: React.FC<ScheduleProps> = ({ schedule, timeFormat = "12h", compact = false, highlightActive = true }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = getScheduleStatus(schedule);
  const active = status.currentPeriod && !status.isDayOver ? status.currentPeriod : status.nextPeriod;
  const format = (time: string) => timeFormat === "24h" ? time : `${convertTo12Hour(time)} ${Number(time.slice(0, 2)) < 12 ? "AM" : "PM"}`;

  if (compact) return <div className="timer-summary">
    <div><span><small>{status.currentPeriod && !status.isDayOver ? "Current class" : "Up next"}</small><strong>{active?.name ?? "School day complete"}</strong></span></div>
    <div className="timer-summary-time"><span><small>Class time</small><strong>{active ? `${format(active.start)} – ${format(active.end)}` : "—"}</strong></span></div>
    <div><span><small>Next</small><strong>{status.nextPeriod?.name ?? "No upcoming class"}{status.nextPeriod && <span className="timer-next-time">{format(status.nextPeriod.start)}</span>}</strong></span></div>
  </div>;

  return (
    <div className={`schedule-list ${compact ? "compact" : ""}`}>
      {schedule.map((period, index) => {
        const start = period.getStartUnix() * 1000;
        const end = period.getEndUnix() * 1000;
        const state = highlightActive ? now >= start && now < end ? "current" : now < start && period === active ? "next" : "" : "";
        return <div className={`schedule-row ${state}`} key={`${period.start}-${period.end}-${index}`}>
          <span className="schedule-period">{period.name}</span>
          <span className="schedule-time">{format(period.start)} – {format(period.end)}</span>
        </div>;
      })}
    </div>
  );
};

export default Schedule;
