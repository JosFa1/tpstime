import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";

import Clock from "../components/clock";
import ClockDescription from "../components/clockDescription";
import Weekdays from "../components/weekdays";
import Schedule from "../components/schedule";
import { WeeklySchedule } from "../types/weekTypes";
import { ClassPeriod } from "../types/classPeriod";
import { ScheduleBlock, schoolToday, useSchedule } from "../hooks/useSchedule";
import { useGlobalClock } from "../hooks/useGlobalClock";
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";
import LightningWidget from "../components/LightningWidget";
import WhatsNew from "../components/WhatsNew";
import { usePreferences } from "../preferences";
import { useTheme } from "../contexts/ThemeContext";
import "./home.css";
import { Clock3, CalendarDays, Zap } from "lucide-react";
import { RequestError, Skeleton } from '../components/Loading';

const MiniTimer = lazy(() => import("../components/MiniTimer").then(module => ({ default: module.MiniTimer })));

type Tab = "timer" | "schedule" | "lightning";

export function ProgressBar({ schedule }: { schedule: ClassPeriod[] }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const period = schedule.find(item => now >= item.getStartUnix() && now < item.getEndUnix());
      setProgress(period ? Math.max(0, Math.min(100, ((now - period.getStartUnix()) / (period.getEndUnix() - period.getStartUnix())) * 100)) : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [schedule]);
  return <div className="home-progress" aria-hidden="true"><div style={{ width: `${progress}%` }} /></div>;
}

function Home() {
  const [prefs] = usePreferences();
  const { mode, selectedCustomThemeId } = useTheme();
  const today = schoolToday();
  const isWeekend = [0, 6].includes(new Date(`${today}T12:00:00Z`).getUTCDay());
  const [tab, setTab] = useState<Tab>(prefs.defaultTab);
  const [focusedTab, setFocusedTab] = useState<Tab>(prefs.defaultTab);
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedDate, setSelectedDate] = useState(isWeekend ? "" : today);
  const [scheduleType, setScheduleType] = useState<"US" | "MS">(() =>
    localStorage.getItem("scheduleType") === "MS" ? "MS" : "US"
  );
  const { week, error, loading, refreshing, reload } = useSchedule();

  useEffect(() => {
    const handler = (event: Event) => setScheduleType((event as CustomEvent).detail);
    window.addEventListener("scheduleTypeChanged", handler);
    return () => window.removeEventListener("scheduleTypeChanged", handler);
  }, []);

  const weekDays: WeeklySchedule = useMemo(() => (week?.days ?? []).map((day) => ({
    title: day.marker.code,
    date: day.date,
    isSchoolDay: day.marker.isSchoolDay,
    schedule: [...(scheduleType === "MS" && day.msBlocks ? day.msBlocks : day.blocks)]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((block: ScheduleBlock) => new ClassPeriod(block.name, block.startTime, block.endTime, Number(block.period) || undefined)),
  })), [week, scheduleType]);

  const todayIndex = weekDays.findIndex((day) => day.date === today);
  const selectedDay = weekDays.find((day) => day.date === selectedDate);
  const todaysSchedule = useMemo(() => !isWeekend && todayIndex >= 0 && weekDays[todayIndex].isSchoolDay ? weekDays[todayIndex].schedule : [], [weekDays, todayIndex, isWeekend]);
  const namedSchedule = useCallback((schedule: ClassPeriod[]) => schedule.map((period) => {
    const personalName = period.period ? prefs.personalNames[String(period.period)]?.trim() : "";
    return personalName ? new ClassPeriod(personalName, period.start, period.end, period.period) : period;
  }), [prefs.personalNames]);
  const displayTodaySchedule = useMemo(() => namedSchedule(todaysSchedule), [namedSchedule, todaysSchedule]);
  const displaySelectedSchedule = useMemo(() => namedSchedule(selectedDay?.schedule ?? []), [namedSchedule, selectedDay]);

  useGlobalClock(displayTodaySchedule);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "showProgressBar") setShowProgressBar(event.newValue === "true");
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setShowProgressBar(typeof detail === "boolean" ? detail : localStorage.getItem("showProgressBar") === "true");
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("showProgressBarChanged", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("showProgressBarChanged", onCustom);
    };
  }, []);

  const [showProgressBar, setShowProgressBar] = useState(() => localStorage.getItem("showProgressBar") !== "false");

  return (
    <main className={`home-shell${mode === 'custom' && selectedCustomThemeId === 'hay' ? ' home-shell--hay' : ''}`}>
      <WhatsNew />
      <header className="home-header">
        <div className="home-days">
          {loading ? <Skeleton shape="weekdays" label="" /> : <Weekdays weeklySchedule={weekDays} todayDate={isWeekend ? "" : today} selectedDate={tab === 'schedule' ? selectedDate : undefined} onSelect={(date) => { setSelectedDate(date); setTab("schedule"); setFocusedTab('schedule'); }} />}
        </div>
        <nav className="home-tabs" aria-label="Main navigation">
          <div className="home-tablist" role="tablist" aria-label="Views" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocusedTab(tab); }}>
          {([ ["timer", Clock3, "Timer"], ["schedule", CalendarDays, "Schedule"], ["lightning", Zap, "Lightning Alert"] ] as const).map(([id, Icon, label], index) => (
            <button key={id} ref={element => { tabButtons.current[index] = element; }} type="button" role="tab" id={`${id}-tab`} aria-controls={`${id}-panel`} aria-selected={tab === id} tabIndex={focusedTab === id ? 0 : -1} className={`home-tab ${tab === id ? "active" : ""}`} onFocus={() => setFocusedTab(id)} onClick={() => setTab(id)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
              if (next !== null) { event.preventDefault(); tabButtons.current[next]?.focus(); }
            }}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />{label}
            </button>
          ))}
          </div>
          <HamburgerMenu />
        </nav>
      </header>
      {prefs.showMiniTimer && tab !== "timer" && displayTodaySchedule.length > 0 && <div className="home-mini-timer"><Suspense fallback={null}><MiniTimer schedule={displayTodaySchedule} showSeconds={prefs.showSeconds} /></Suspense></div>}
      {showProgressBar && tab === "timer" && <ProgressBar schedule={todaysSchedule} />}
      {error && <RequestError message={error} pending={refreshing} retry={reload} retained={Boolean(week)} />}

        <section className="timer-view" role="tabpanel" id="timer-panel" aria-labelledby="timer-tab" tabIndex={0} hidden={tab !== 'timer'} aria-busy={loading}>
          {tab === 'timer' && <>
          {isWeekend && <p className="no-school">No school this weekend</p>}
          {!isWeekend && loading ? <Skeleton shape="timer" label="Loading today’s schedule…" /> : todaysSchedule.length > 0 ? <>
            <ClockDescription schedule={displayTodaySchedule} />
            <div className="timer-content">
              <Clock schedule={displayTodaySchedule} showSeconds={prefs.showSeconds} />
              <Schedule schedule={displayTodaySchedule} timeFormat={prefs.timeFormat} compact />
            </div>
          </> : !isWeekend && !error && (todayIndex >= 0 && !weekDays[todayIndex].isSchoolDay ? <p className="no-school">No school today</p> : <p className="home-message">No schedule has been published for today.</p>)}
          </>}
        </section>

      <section className="schedule-view" role="tabpanel" id="schedule-panel" aria-labelledby="schedule-tab" tabIndex={0} hidden={tab !== 'schedule'} aria-busy={loading}>
        {tab === 'schedule' && <>
        <div className="schedule-heading"><h1>{selectedDay?.date ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${selectedDay.date}T12:00:00Z`)) : "Schedule"}</h1></div>
        {loading ? <Skeleton shape="schedule" label="Loading schedule…" /> : selectedDay?.isSchoolDay ? displaySelectedSchedule.length ? <Schedule schedule={displaySelectedSchedule} timeFormat={prefs.timeFormat} highlightActive={selectedDay.date === today} /> : <p className="no-school">No classes have been published for this day.</p> : !error && <p className="no-school">{selectedDay ? "No school" : !weekDays.length ? "No schedule has been published for this week." : selectedDate ? "No schedule has been published for this date. Select another weekday." : "Select a weekday above to view its schedule."}</p>}
        </>}
      </section>

      <section className="lightning-view" role="tabpanel" id="lightning-panel" aria-labelledby="lightning-tab" tabIndex={0} hidden={tab !== 'lightning'}>{tab === 'lightning' && <LightningWidget />}</section>
      <FooterNote />
    </main>
  );
}

export default Home;
