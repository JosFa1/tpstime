const SCHOOL_TIME_ZONE = "America/New_York";
const schoolDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHOOL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partsAt(timestamp: number) {
  return Object.fromEntries(schoolDateFormatter.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, Number(value)]));
}

function wallTimeAtSchool(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  const { year, month, day } = partsAt(Date.now());
  const wallTime = Date.UTC(year, month - 1, day, hours, minutes);
  const wallParts = partsAt(wallTime);
  const wallOffset = Date.UTC(wallParts.year, wallParts.month - 1, wallParts.day, wallParts.hour, wallParts.minute, wallParts.second) - wallTime;
  const first = wallTime - wallOffset;
  const firstParts = partsAt(first);
  const matches = (local: ReturnType<typeof partsAt>) =>
    local.year === year && local.month === month && local.day === day && local.hour === hours && local.minute === minutes;
  if (matches(firstParts)) return Math.floor(first / 1000);

  const firstOffset = Date.UTC(firstParts.year, firstParts.month - 1, firstParts.day, firstParts.hour, firstParts.minute, firstParts.second) - first;
  const second = wallTime - firstOffset;
  const secondParts = partsAt(second);
  if (matches(secondParts)) return Math.floor(second / 1000);

  // For a nonexistent spring-forward time, move forward by the DST gap.
  const firstWallTime = Date.UTC(firstParts.year, firstParts.month - 1, firstParts.day, firstParts.hour, firstParts.minute);
  return Math.floor((firstWallTime >= wallTime ? first : second) / 1000);
}

export class ClassPeriod {
  name: string;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  period?: number;

  constructor(name: string, start: string, end: string, period?: number) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.period = period;
  }

  getStartUnix(): number {
    return this.timeStringToUnix(this.start);
  }

  getEndUnix(): number {
    return this.timeStringToUnix(this.end);
  }

  getDurationSeconds(): number {
    return this.getEndUnix() - this.getStartUnix();
  }

  getPeriod(): number | undefined {
    return this.period;
  }

  private timeStringToUnix(time: string): number {
    return wallTimeAtSchool(time);
  }
}
