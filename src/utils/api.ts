/**
 * Utility functions for interacting with the backend API.
 * Centralizing the logic makes it easier to swap out the backend
 * implementation or adjust headers in one place later on.
 */

// Base URL for the backend API. Falls back to localhost during development.
export const API_URL = process.env.REACT_APP_API_URL || "http://tpstime.trinityprep.org:3001";

/**
 * Helper around the native fetch API that automatically prefixes the
 * request with the API_URL and verifies that a JSON response is returned.
 *
 * @param path   Relative path of the API endpoint (e.g. `/schedule`).
 * @param options Standard fetch options such as method, headers, etc.
 * @returns Parsed JSON response from the server.
 * @throws  If the response status is not OK or the content type is not JSON.
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Perform the request against the backend
  const response = await fetch(`${API_URL}${path}`, options);

  // If the response code is not in the 200 range, treat it as an error
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    // When the response is not JSON, grab the raw text to help debugging
    const text = await response.text();
    throw new Error(
      `Expected JSON response but received: ${contentType}. Response: ${text}`
    );
  }

  // Return the parsed JSON payload to the caller
  return (await response.json()) as T;
}

