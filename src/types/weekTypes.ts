import { ClassPeriod } from "./classPeriod"; // assuming ClassPeriod is a class with methods

export type DaySchedule = {
  title: string; // Example: "Monday"
  date: string;
  isSchoolDay: boolean;
  schedule: ClassPeriod[]; // An array of class periods
};

export type WeeklySchedule = DaySchedule[];
