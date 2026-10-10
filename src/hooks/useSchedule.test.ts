import { currentMonday } from './useSchedule';

it('uses the school-week Monday in New York time', () => {
  expect(currentMonday(new Date('2026-10-07T15:00:00Z'))).toBe('2026-10-05'); // Wednesday
  expect(currentMonday(new Date('2026-10-05T03:00:00Z'))).toBe('2026-09-28'); // still Sunday in NY
  expect(currentMonday(new Date('2026-11-02T12:00:00Z'))).toBe('2026-11-02'); // Monday after DST ends
});
