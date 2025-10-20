import { ClockParts } from "../types/clockParts";

export function formatClockParts(totalSeconds: number): ClockParts {
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      leftSide: String(hours),
      middleSide: String(minutes).padStart(2, "0"),
      rightSide: String(seconds).padStart(2, "0"),
    };
  } else {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      leftSide: String(minutes),
      rightSide: String(seconds).padStart(2, "0"),
    };
  }
}
