import { useState, useEffect } from "react";
// Pull in shared API helper so all network requests are centralized
import { apiFetch } from "../utils/api";

interface UseScheduleReturn {
  schedule: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSchedule(): UseScheduleReturn {
  // Store the schedule data returned from the backend
  const [schedule, setSchedule] = useState<any>(null);
  // Whether a request is in flight; used to show loading states
  const [loading, setLoading] = useState(false);
  // Holds any error messages from failed requests
  const [error, setError] = useState<string | null>(null);

  /**
   * Retrieve the class schedule from the backend API.
   * Errors are caught and stored so the UI can react accordingly.
   */
  const fetchSchedule = async () => {
    // Indicate that a request is in progress
    setLoading(true);
    setError(null);

    try {
      // Request `/schedule` from the backend. The helper handles
      // base URL prefixing and JSON validation.
      const data = await apiFetch("/schedule");
      // Persist the schedule so components can render it
      setSchedule(data);
    } catch (err) {
      // Gracefully surface errors to any components using this hook
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schedule";
      setError(errorMessage);
      console.error("Error fetching schedule:", err);
    } finally {
      // Always clear the loading state once the request resolves
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
  };
}
