import React from "react";
import { render, screen } from "@testing-library/react";
import Clock from "./clock";
import { getScheduleStatus } from "../hooks/scheduleStatus";

jest.mock("../hooks/scheduleStatus", () => ({
  getScheduleStatus: jest.fn(),
}));

const mockedGetScheduleStatus = getScheduleStatus as jest.MockedFunction<typeof getScheduleStatus>;

beforeEach(() => {
  mockedGetScheduleStatus.mockReturnValue({ secondsUntilNext: 34 * 60 + 5, isDayOver: false });
});

test("hides seconds without leaving a trailing colon for sub-hour countdowns", () => {
  render(<Clock schedule={[]} showSeconds={false} />);
  expect(screen.getByText("34")).toBeInTheDocument();
});

test("retains seconds and displays minutes for longer countdowns", () => {
  mockedGetScheduleStatus.mockReturnValue({ secondsUntilNext: 83 * 60 + 5, isDayOver: false });
  const { rerender } = render(<Clock schedule={[]} showSeconds />);
  expect(screen.getByText("1:23:05")).toBeInTheDocument();

  rerender(<Clock schedule={[]} showSeconds={false} />);
  expect(screen.getByText("1:23")).toBeInTheDocument();
});
