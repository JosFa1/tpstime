import { useEffect } from 'react';
import { ClassPeriod } from '../types/classPeriod';
import { getScheduleStatus } from './scheduleStatus';
import { formatClockParts } from './formatClockParts';

export function useGlobalClock(schedule: ClassPeriod[]) {
  useEffect(() => {
    const updateTitle = () => {
      const status = getScheduleStatus(schedule);
      
      if (status.isDayOver) {
        document.title = 'School Day Complete | TPSTime';
        return;
      }

      const { leftSide, middleSide, rightSide } = formatClockParts(status.secondsUntilNext);
      const timeString = middleSide ? `${leftSide}:${middleSide}:${rightSide}` : `${leftSide}:${rightSide}`;
      
      if (status.currentPeriod) {
        document.title = `${timeString} - ${status.currentPeriod.name} | TPSTime`;
      } else if (status.nextPeriod) {
        document.title = `${timeString} - Until ${status.nextPeriod.name} | TPSTime`;
      } else {
        document.title = 'TPSTime';
      }
    };

    updateTitle();
    const interval = setInterval(updateTitle, 1000);

    return () => {
      clearInterval(interval);
      document.title = 'TPSTime';
    };
  }, [schedule]);
}
