import { useState, useCallback } from "react";
// Use shared API helper to keep network logic consistent
import { apiFetch } from "../utils/api";

interface UseScheduleOperationsReturn {
  // Updates the subject for a specific period. Returns success state
  updateClassPeriod: (period: number, subject: string) => Promise<boolean>;
  // Removes the class period entirely
  deleteClassPeriod: (period: number) => Promise<boolean>;
  // Indicates whether a network request is currently running
  loading: boolean;
  // Any error message from the last failed request
  error: string | null;
}

export function useScheduleOperations(
  onSuccess?: () => void
): UseScheduleOperationsReturn {
  // Track loading and error state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateClassPeriod = useCallback(
    async (period: number, subject: string): Promise<boolean> => {
  // No user authentication required

      if (!subject.trim()) {
        setError("Subject name cannot be empty");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Use helper to send PUT request to `/schedule/:period`
        await apiFetch(`/schedule/${period}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject: subject.trim() }),
        });

        if (onSuccess) {
          onSuccess();
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update class period";
        setError(errorMessage);
        console.error("Error updating class period:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const deleteClassPeriod = useCallback(
    async (period: number): Promise<boolean> => {
  // No user authentication required

      setLoading(true);
      setError(null);

      try {
        // Issue DELETE request for the selected period
        await apiFetch(`/schedule/${period}`, {
          method: "DELETE",
        });

        if (onSuccess) {
          onSuccess();
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete class period";
        setError(errorMessage);
        console.error("Error deleting class period:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return {
    updateClassPeriod,
    deleteClassPeriod,
    loading,
    error,
  };
}