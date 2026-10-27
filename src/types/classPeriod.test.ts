import { ClassPeriod } from "./classPeriod";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("interprets class times using New York wall time", () => {
  jest.setSystemTime(new Date("2026-06-01T16:00:00Z"));
  const period = new ClassPeriod("Math", "08:00", "09:00");

  expect(new Date(period.getStartUnix() * 1000).toISOString()).toBe("2026-06-01T12:00:00.000Z");
  expect(new Date(period.getEndUnix() * 1000).toISOString()).toBe("2026-06-01T13:00:00.000Z");
});

test("moves a nonexistent spring-forward wall time past the DST gap", () => {
  jest.setSystemTime(new Date("2026-03-08T12:00:00Z"));
  const period = new ClassPeriod("DST gap", "02:30", "03:30");

  expect(new Date(period.getStartUnix() * 1000).toISOString()).toBe("2026-03-08T07:30:00.000Z");
});

test("chooses the first occurrence of an ambiguous fall-back wall time", () => {
  jest.setSystemTime(new Date("2026-11-01T16:00:00Z"));
  const period = new ClassPeriod("DST fold", "01:30", "02:30");

  expect(new Date(period.getStartUnix() * 1000).toISOString()).toBe("2026-11-01T05:30:00.000Z");
});
