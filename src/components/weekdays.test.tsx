import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Weekdays from "./weekdays";
import { WeeklySchedule } from "../types/weekTypes";

test("shows only weekdays, marks the selected date, and selects a date on click", async () => {
  const weeklySchedule: WeeklySchedule = [
    ["2026-10-26", "A"], ["2026-10-27", "B"], ["2026-10-28", "C"],
    ["2026-10-29", "D"], ["2026-10-30", "E"], ["2026-10-31", "W"], ["2026-11-01", "W"],
  ].map(([date, title]) => ({ date, title, isSchoolDay: title !== "W", schedule: [] }));
  const onSelect = jest.fn();

  render(<Weekdays weeklySchedule={weeklySchedule} todayDate="2026-10-26" selectedDate="2026-10-30" onSelect={onSelect} />);

  expect(screen.getAllByRole("button")).toHaveLength(5);
  const monday = screen.getByRole("button", { name: "Monday 2026-10-26, school day" });
  expect(monday).toHaveTextContent("A");
  expect(monday).toHaveAttribute("aria-current", "date");
  const friday = screen.getByRole("button", { name: "Friday 2026-10-30, school day" });
  expect(friday).not.toHaveAttribute("aria-current");
  expect(friday).toHaveAttribute('aria-pressed', 'true');
  expect(monday).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(friday);
  expect(onSelect).toHaveBeenCalledWith("2026-10-30");
});
