import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClassPeriod } from '../types/classPeriod';
import { getScheduleStatus } from '../hooks/scheduleStatus';
import { formatClockParts } from '../hooks/formatClockParts';
import { schoolToday, useSchedule } from '../hooks/useSchedule';
import { usePreferences } from '../preferences';
import './miniTimer.css';

export function MiniTimer({ schedule, showSeconds }: { schedule: ClassPeriod[]; showSeconds: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  if (!schedule.length) return null;
  const status = getScheduleStatus(schedule);
  if (status.isDayOver) return null;
  const { leftSide, middleSide, rightSide } = formatClockParts(status.secondsUntilNext);
  const time = showSeconds ? `${leftSide}:${middleSide ? `${middleSide}:` : ''}${rightSide}` : `${leftSide}${middleSide ? `:${middleSide}` : ''}`;
  const period = status.currentPeriod;
  const progress = period ? Math.max(0, Math.min(100, (now / 1000 - period.getStartUnix()) / (period.getEndUnix() - period.getStartUnix()) * 100)) : 0;
  return <aside className="mini-timer" aria-label="Current class timer"><div><span>{period ? `Until ${period.name} ends` : `Until ${status.nextPeriod?.name} starts`}</span><strong>{time}</strong></div><div className="mini-timer__track" role="progressbar" aria-label="Current class progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><div style={{ width: `${progress}%` }} /></div></aside>;
}

export function PageMiniTimer() {
  const { week } = useSchedule();
  const [prefs] = usePreferences();
  const scheduleType = localStorage.getItem('scheduleType') === 'MS' ? 'MS' : 'US';
  const schedule = useMemo(() => {
    const day = week?.days.find(item => item.date === schoolToday());
    if (!day?.marker.isSchoolDay) return [];
    return [...(scheduleType === 'MS' && day.msBlocks ? day.msBlocks : day.blocks)].sort((a, b) => a.sortOrder - b.sortOrder).map(block => new ClassPeriod(prefs.personalNames[String(block.period)]?.trim() || block.name, block.startTime, block.endTime, Number(block.period) || undefined));
  }, [week, scheduleType, prefs.personalNames]);
  if (!prefs.showMiniTimer || !schedule.length || getScheduleStatus(schedule).isDayOver) return null;
  return <Link to="/" className="mini-timer-link" aria-label="Return to timer"><MiniTimer schedule={schedule} showSeconds={prefs.showSeconds} /></Link>;
}
