import { useEffect, useState } from "react";

// Same published schedule the TPSTime extension reads, managed in the admin panel.
export const SUPABASE_URL = "https://bbeswtssigkglspkleyc.supabase.co";
const SCHEDULE_URL = `${SUPABASE_URL}/functions/v1/extension-schedule`;
// Publishable key: public by design, only used to renew and revoke the signed-in session.
export const PUBLISHABLE_KEY = "sb_publishable_gsu7MkBFYTqUGYzXvgdkow_yUT6P9Dy";

export type ScheduleBlock = {
  name: string;
  period?: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
};

export type PublishedDay = {
  date: string;
  marker: { code: string; name: string; isSchoolDay: boolean };
  blocks: ScheduleBlock[];
  msBlocks?: ScheduleBlock[];
};

export type QuickLink = { label: string; icon?: string; sortOrder: number };

export type PublishedWeek = { days: PublishedDay[]; quickLinks: QuickLink[] };

/** Today's date at school (America/New_York) as YYYY-MM-DD. */
export const schoolToday = (now = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now);

/** Monday of the current school week (America/New_York) as YYYY-MM-DD. */
export function currentMonday(now = new Date()): string {
  const date = new Date(`${schoolToday(now)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

async function renewSession(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return false;
  const session = await response.json();
  if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") return false;
  localStorage.setItem("accessToken", session.access_token);
  localStorage.setItem("refreshToken", session.refresh_token);
  return true;
}

function signOutToLogin() {
  ["user", "accessToken", "refreshToken"].forEach((key) => localStorage.removeItem(key));
  window.location.assign("/login");
}

async function fetchWeek(): Promise<PublishedWeek> {
  const request = () =>
    fetch(`${SCHEDULE_URL}?week=${currentMonday()}&divisions=1`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}` },
    });
  let response = await request();
  if (response.status === 401) {
    if (!(await renewSession())) {
      signOutToLogin();
      throw new Error("Your session expired. Please sign in again.");
    }
    response = await request();
  }
  if (!response.ok) throw new Error("The schedule could not be loaded.");
  return response.json();
}

export function useSchedule() {
  const [week, setWeek] = useState<PublishedWeek | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchWeek()
      .then((data) => active && setWeek(data))
      .catch((err) => {
        console.error("[useSchedule] Error fetching schedule:", err);
        if (active) setError(err instanceof Error ? err.message : "The schedule could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  return { week, loading: !week && !error, error };
}
