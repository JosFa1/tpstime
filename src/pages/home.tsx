import Clock from "../components/clock";
import ClockDescription from "../components/clockDescription";
import { aSchedule, bSchedule, cSchedule, sSchedule, NSchedule } from "../types/schedule";
import { msASchedule, msBSchedule, msCSchedule, msSSchedule } from "../types/msSchedule";
import Weekdays from "../components/weekdays";
import { WeeklySchedule } from "../types/weekTypes";
import { getTodayIndex, mapScheduleWithClassNames } from "../utils/utils";
import Schedule from "../components/schedule";
import { ClassName } from "../types/className";
import { useSchedule } from "../hooks/useSchedule";
import { useGlobalClock } from "../hooks/useGlobalClock";
import { useMemo, useEffect, useState } from "react";
import React from "react";
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";

function ProgressBar({ progress }: { progress: number }) {
  // moving gradient that uses theme CSS variables so it matches themes
  const pct = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
  return (
    <div className="w-full" aria-hidden>
      <style>{`\n        @keyframes progressSlide {\n          0% { background-position: 0% 50%; }\n          100% { background-position: 200% 50%; }\n        }\n      `}</style>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border, #e0e0e0)' }}>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            backgroundImage: `linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))`,
            backgroundSize: '200% 100%',
            animation: 'progressSlide 3.5s linear infinite'
          }}
        />
      </div>
    </div>
  );
}

function Home() {
  const [scheduleType, setScheduleType] = React.useState<'US' | 'MS'>(() => {
    const saved = localStorage.getItem('scheduleType');
    return saved === 'MS' ? 'MS' : 'US';
  });
  const { schedule, loading } = useSchedule();

  React.useEffect(() => {
    const handler = (e: any) => {
      setScheduleType(e.detail);
    };
    window.addEventListener('scheduleTypeChanged', handler);
    return () => window.removeEventListener('scheduleTypeChanged', handler);
  }, []);

  // US schedule
  const ADayUS = { title: "A", schedule: aSchedule };
  const BDayUS = { title: "B", schedule: bSchedule };
  const CDayUS = { title: "C", schedule: cSchedule };
  const SDayUS = { title: "A", schedule: sSchedule };  // Using A as display title while keeping sSchedule
  // MS schedule
  const ADayMS = { title: "A", schedule: msASchedule };
  const BDayMS = { title: "B", schedule: msBSchedule };
  const CDayMS = { title: "C", schedule: msCSchedule };
  const SDayMS = { title: "A", schedule: msSSchedule };  // Using A as display title while keeping msSSchedule

  const NSDay = { title: "N", schedule: NSchedule }; // Universal no school

  const defaultClassNames: ClassName[] = useMemo(() => [
    { name: "Period 1", period: 1 },
    { name: "Period 2", period: 2 },
    { name: "Period 3", period: 3 },
    { name: "Period 4", period: 4 },
    { name: "Period 5", period: 5 },
    { name: "Period 6", period: 6 },
    { name: "Period 7", period: 7 },
  ], []);

  const classNames: ClassName[] = useMemo(() => {
    if (
      loading ||
      !schedule ||
      !Array.isArray(schedule) ||
      schedule.length === 0
    ) {
      return defaultClassNames;
    }

    const dbClassNames: ClassName[] = schedule.map((item: any) => ({
      name: item.subject || `Period ${item.period}`,
      period: item.period,
    }));

    const periodMap = new Map<number, string>();
    dbClassNames.forEach((className) => {
      if (className.period) {
        periodMap.set(
          className.period,
          className.name || `Period ${className.period}`
        );
      }
    });

    return defaultClassNames.map((defaultClass) => ({
      name: periodMap.get(defaultClass.period!) || defaultClass.name,
      period: defaultClass.period,
    }));
  }, [schedule, loading, defaultClassNames]);

  // Weekly pattern: A, A, B, C, A
  const thisWeek: WeeklySchedule = scheduleType === 'US'
    ? [ADayUS, ADayUS, BDayUS, CDayUS, SDayUS]
    : [ADayMS, ADayMS, BDayMS, CDayMS, SDayUS];

  // Get today's schedule for the global clock
  const todaysSchedule = useMemo(() => {
    const todayIndex = getTodayIndex();
    if (todayIndex === -1) return [];
    return mapScheduleWithClassNames(thisWeek[todayIndex].schedule, classNames);
  }, [thisWeek, classNames]);

  // Run global clock to update document title
  useGlobalClock(todaysSchedule);

  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(() => {
    const saved = localStorage.getItem("showProgressBar");
    return saved === "true";
  });

  // listen for storage changes from other tabs and for our custom event from the settings page
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'showProgressBar') {
        setShowProgressBar(e.newValue === 'true');
      }
    };

    const onCustom = (e: any) => {
      // custom event sends boolean in detail
      if (typeof e.detail === 'boolean') setShowProgressBar(e.detail);
      else setShowProgressBar(localStorage.getItem('showProgressBar') === 'true');
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('showProgressBarChanged', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('showProgressBarChanged', onCustom as EventListener);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const currentPeriod = todaysSchedule.find((period) => {
        const start = period.getStartUnix();
        const end = period.getEndUnix();
        return now >= start && now < end;
      });

      if (!currentPeriod) {
        setProgress(0);
        return;
      }

      const start = currentPeriod.getStartUnix();
      const end = currentPeriod.getEndUnix();
      const elapsed = now - start;
      const total = end - start;
      const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
      setProgress(pct);
    };

    // run immediately then every second
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [todaysSchedule]);

  return (
    <div className="text-text bg-background min-h-screen w-full flex flex-col">
      {/* Top bar: HamburgerMenu and Weekdays on same row */}
      <div className="w-full flex flex-row justify-between items-center pt-4 pb-2 px-2 sm:px-4 bg-background">
        <div className="flex flex-row items-center gap-2">
          <Weekdays
            weeklySchedule={thisWeek}
            todayIndex={getTodayIndex()}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <HamburgerMenu />
        </div>
      </div>
      {/* Progress bar placed under top bar so it feels attached to header */}
      {showProgressBar && (
        <div className="px-2 sm:px-4 mt-2">
          <ProgressBar progress={progress} />
        </div>
      )}
      {/* Main content */}
      {getTodayIndex() === -1 ? (
        <div className="text-secondary w-full min-h-[60vh] flex justify-center items-center text-xl sm:text-2xl">
          No schedule available for today.
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center w-full bg-background px-2 py-6 sm:p-8 min-h-[60vh]">
            <div className="flex flex-col items-center w-full max-w-2xl">
              <div className="w-full px-2 sm:px-4 mb-2">
                <ClockDescription
                  schedule={mapScheduleWithClassNames(
                    thisWeek[getTodayIndex()].schedule,
                    classNames
                  )}
                />
              </div>
              <Clock
                schedule={mapScheduleWithClassNames(
                  thisWeek[getTodayIndex()].schedule,
                  classNames
                )}
              />
            </div>
          </div>
          <div className="w-full px-2 sm:px-8 pt-0 mt-4 bg-background flex justify-center pb-4">
            <div className="w-full max-w-2xl">
              <Schedule
                schedule={mapScheduleWithClassNames(
                  thisWeek[getTodayIndex()].schedule,
                  classNames
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}



const HomeWithFooter: React.FC = () => (
  <>
    <Home />
    <FooterNote />
  </>
);

export default HomeWithFooter;
