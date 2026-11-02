import { useCallback, useEffect, useRef, useState } from "react";
import { localPreview } from "../localPreview";

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

export type PublishedTheme = {
  id: string;
  name: string;
  isEnabled: boolean;
  sortOrder: number;
  tokens: { accent: string; background: string; surface: string; primaryText: string; secondaryText: string; border: string; success: string; warning: string; error: string };
};

export type PublishedWeek = { days: PublishedDay[]; quickLinks: QuickLink[]; previousHousePoints?: QuickLink[] | null; housePointsHistory?: { publishedAt: string; scores: Record<string, number> }[]; themes?: PublishedTheme[] };

/** Today's date at school (America/New_York) as YYYY-MM-DD. */
export const schoolToday = (now = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now);

/** Monday of the current school week (America/New_York) as YYYY-MM-DD. */
export function currentMonday(now = new Date()): string {
  const date = new Date(`${schoolToday(now)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

async function renewSession(signal: AbortSignal): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    signal,
  });
  if (signal.aborted || localStorage.getItem("refreshToken") !== refreshToken) throw new DOMException("Obsolete session request", "AbortError");
  if (!response.ok) return false;
  const session = await response.json();
  if (signal.aborted || localStorage.getItem("refreshToken") !== refreshToken) throw new DOMException("Obsolete session request", "AbortError");
  if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") return false;
  localStorage.setItem("accessToken", session.access_token);
  localStorage.setItem("refreshToken", session.refresh_token);
  return true;
}

function signOutToLogin() {
  ["user", "accessToken", "refreshToken"].forEach((key) => localStorage.removeItem(key));
  window.location.assign("/login");
}

async function fetchWeek(signal: AbortSignal, houseHistory: boolean, pointsTimeline: boolean): Promise<PublishedWeek> {
  if (localPreview) {
    const monday = new Date(`${currentMonday()}T00:00:00Z`);
    return {
      days: Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setUTCDate(date.getUTCDate() + index);
        const isSchoolDay = index < 5;
        return {
          date: date.toISOString().slice(0, 10),
          marker: { code: isSchoolDay ? "A" : "N", name: isSchoolDay ? "A Day" : "No School", isSchoolDay },
          blocks: isSchoolDay ? [{ name: "Example class", period: "1", startTime: "00:00", endTime: "23:59", sortOrder: 0 }] : [],
        };
      }),
      quickLinks: [
        { label: 'Hay', icon: 'house:hay', sortOrder: 450 }, { label: 'Maughan', icon: 'house:maughan', sortOrder: 390 },
        { label: 'Lawson', icon: 'house:lawson', sortOrder: 340 }, { label: 'St. John', icon: 'house:st-john', sortOrder: 360 },
        { label: 'Ellis', icon: 'house:ellis', sortOrder: 410 }, { label: 'Brokaw', icon: 'house:brokaw', sortOrder: 470 },
      ],
      previousHousePoints: [
        { label: 'Hay', icon: 'house:hay', sortOrder: 430 }, { label: 'Maughan', icon: 'house:maughan', sortOrder: 370 },
        { label: 'Lawson', icon: 'house:lawson', sortOrder: 320 }, { label: 'St. John', icon: 'house:st-john', sortOrder: 330 },
        { label: 'Ellis', icon: 'house:ellis', sortOrder: 390 }, { label: 'Brokaw', icon: 'house:brokaw', sortOrder: 420 },
      ],
      housePointsHistory: [
        { publishedAt: '2026-09-08T16:00:00Z', scores: { hay: 160, maughan: 120, lawson: 100, stjohn: 140, ellis: 130, brokaw: 110 } },
        { publishedAt: '2026-09-22T16:00:00Z', scores: { hay: 260, maughan: 230, lawson: 190, stjohn: 220, ellis: 250, brokaw: 220 } },
        { publishedAt: '2026-10-06T16:00:00Z', scores: { hay: 350, maughan: 300, lawson: 260, stjohn: 270, ellis: 320, brokaw: 340 } },
        { publishedAt: '2026-10-20T16:00:00Z', scores: { hay: 430, maughan: 370, lawson: 320, stjohn: 330, ellis: 390, brokaw: 420 } },
        { publishedAt: '2026-10-27T16:00:00Z', scores: { hay: 450, maughan: 390, lawson: 340, stjohn: 360, ellis: 410, brokaw: 470 } },
      ],
    };
  }
  const request = () =>
    fetch(`${SCHEDULE_URL}?week=${currentMonday()}&divisions=1${houseHistory ? "&houseHistory=1" : ""}${pointsTimeline ? "&pointsTimeline=1" : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}` },
      signal,
    });
  let response = await request();
  if (response.status === 401) {
    if (!(await renewSession(signal))) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      signOutToLogin();
      throw new Error("Your session expired. Please sign in again.");
    }
    response = await request();
  }
  if (!response.ok) throw new Error("The schedule could not be loaded.");
  const data = await response.json();
  if (!data || !Array.isArray(data.days) || !Array.isArray(data.quickLinks)) throw new Error("The schedule response was unavailable. Please try again.");
  return data;
}

export function useSchedule(houseHistory = false, pointsTimeline = false) {
  const [week, setWeek] = useState<PublishedWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const request = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    void fetchWeek(controller.signal, houseHistory, pointsTimeline)
      .then((data) => {
        if (request.current !== controller || controller.signal.aborted) return;
        setWeek(data);
        setError(null);
      })
      .catch((err) => {
        if (request.current !== controller) return;
        setError(controller.signal.aborted ? "The schedule is taking too long to load. Check your connection and try again." : err instanceof Error ? err.message : "The schedule could not be loaded.");
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (request.current === controller) {
          request.current = null;
          setPending(false);
        }
      });
  }, [houseHistory, pointsTimeline]);

  useEffect(() => {
    reload();
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [reload]);

  return { week, loading: !week && pending, refreshing: pending, error, reload };
}
