import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ClassPeriod } from "../types/classPeriod";
import { convertTo12Hour } from "../utils/utils";
import { getScheduleStatus } from "../hooks/scheduleStatus";

type ScheduleProps = {
  schedule: ClassPeriod[];
  timeFormat?: "12h" | "24h";
  compact?: boolean;
  highlightActive?: boolean;
};

function SummaryValue({ text, time }: { text: string; time?: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      element.style.fontSize = '';
      const content = element.firstElementChild;
      const width = content?.getBoundingClientRect().width ?? 0;
      const available = element.clientWidth;
      if (available > 0 && width > available) {
        const size = parseFloat(getComputedStyle(element).fontSize);
        element.style.fontSize = `${size * (available - 1) / width}px`;
      }
    };
    fit();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    return () => { active = false; observer?.disconnect(); window.removeEventListener('resize', fit); };
  }, [text, time]);
  return <strong ref={ref}><span>{text}{time && <span className="timer-next-time">{time}</span>}</span></strong>;
}

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
    <div><span><small>{status.currentPeriod && !status.isDayOver ? "Current class" : "Up next"}</small><SummaryValue text={active?.name ?? "School day complete"} /></span></div>
    <div className="timer-summary-time"><span><small>Class time</small><SummaryValue text={active ? `${format(active.start)} – ${format(active.end)}` : "—"} /></span></div>
    <div><span><small>Next</small><SummaryValue text={status.nextPeriod?.name ?? "No upcoming class"} time={status.nextPeriod ? format(status.nextPeriod.start) : undefined} /></span></div>
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
