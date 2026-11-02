import { WeeklySchedule } from "../types/weekTypes";

type WeekdaysProps = {
  weeklySchedule: WeeklySchedule;
  todayDate: string;
  selectedDate?: string;
  onSelect: (date: string) => void;
};

function Weekdays({ weeklySchedule, todayDate, selectedDate, onSelect }: WeekdaysProps) {
  return (
    <div className="weekday-strip">
      {weeklySchedule.filter((day) => day.date && new Date(`${day.date}T12:00:00Z`).getUTCDay() >= 1 && new Date(`${day.date}T12:00:00Z`).getUTCDay() <= 5).map((day) => (
        <button
          key={day.date}
          type="button"
          onClick={() => day.date && onSelect(day.date)}
          aria-label={`${new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${day.date}T12:00:00Z`))} ${day.date}, ${day.isSchoolDay ? "school day" : "no school"}`}
          aria-current={todayDate === day.date ? "date" : undefined}
          aria-pressed={selectedDate === day.date}
          className={`weekday ${todayDate === day.date ? "today" : ""} ${selectedDate === day.date ? 'selected' : ''} ${day.isSchoolDay ? "" : "off"}`}
        >
          {day.title}
        </button>
      ))}
    </div>
  );
}

export default Weekdays;
