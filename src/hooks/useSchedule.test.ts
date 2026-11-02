import { act, renderHook, waitFor } from '@testing-library/react';
import { currentMonday, useSchedule } from './useSchedule';

jest.mock('../localPreview', () => ({ localPreview: false }));
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; localStorage.clear(); jest.useRealTimers(); });

it('uses the school-week Monday in New York time', () => {
  expect(currentMonday(new Date('2026-10-07T15:00:00Z'))).toBe('2026-10-05'); // Wednesday
  expect(currentMonday(new Date('2026-10-05T03:00:00Z'))).toBe('2026-09-28'); // still Sunday in NY
  expect(currentMonday(new Date('2026-11-02T12:00:00Z'))).toBe('2026-11-02'); // Monday after DST ends
});

it('keeps loaded data during refresh failures and prevents overlapping retries', async () => {
  const week = { days: [], quickLinks: [] };
  global.fetch = jest.fn().mockResolvedValueOnce(new Response(JSON.stringify(week))).mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(new Response(JSON.stringify(week)));
  const { result } = renderHook(useSchedule);
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.week).toEqual(week));
  act(() => { result.current.reload(); result.current.reload(); });
  await waitFor(() => expect(result.current.error).toBe('Offline'));
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(result.current.week).toEqual(week);
  expect(result.current.loading).toBe(false);
  act(() => result.current.reload());
  await waitFor(() => expect(result.current.error).toBeNull());
});

it('times out an initial request and allows retry', async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn((_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))) as jest.Mock;
  const { result } = renderHook(useSchedule);
  await act(async () => { jest.advanceTimersByTime(10_000); });
  expect(result.current.error).toMatch(/taking too long/);
  expect(result.current.loading).toBe(false);
  act(() => { result.current.reload(); result.current.reload(); });
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

it('renews an expired session and retries the authenticated published endpoint', async () => {
  localStorage.setItem('accessToken', 'old-access');
  localStorage.setItem('refreshToken', 'old-refresh');
  global.fetch = jest.fn().mockResolvedValueOnce(new Response('', { status: 401 })).mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'new-access', refresh_token: 'new-refresh' }))).mockResolvedValueOnce(new Response(JSON.stringify({ days: [], quickLinks: [] })));
  const { result } = renderHook(useSchedule);
  await waitFor(() => expect(result.current.week).not.toBeNull());
  expect(global.fetch).toHaveBeenNthCalledWith(3, expect.stringContaining('/functions/v1/extension-schedule?'), expect.objectContaining({ headers: { Authorization: 'Bearer new-access' } }));
  expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
});

it('aborts on unmount and ignores an obsolete response after remount', async () => {
  let resolveFirst: (value: Response) => void = () => {};
  global.fetch = jest.fn().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; })).mockResolvedValueOnce(new Response(JSON.stringify({ days: [], quickLinks: [] })));
  const first = renderHook(useSchedule);
  const signal = (global.fetch as jest.Mock).mock.calls[0][1].signal as AbortSignal;
  first.unmount();
  expect(signal.aborted).toBe(true);
  const second = renderHook(useSchedule);
  await waitFor(() => expect(second.result.current.week).toEqual({ days: [], quickLinks: [] }));
  await act(async () => resolveFirst(new Response(JSON.stringify({ days: [], quickLinks: [{ label: 'Obsolete', sortOrder: 1 }] }))));
  expect(second.result.current.week?.quickLinks).toEqual([]);
});

it('does not sign out a newer session when an older renewal fails', async () => {
  localStorage.setItem('accessToken', 'old-access');
  localStorage.setItem('refreshToken', 'old-refresh');
  let finishRenewal: (value: Response) => void = () => {};
  global.fetch = jest.fn().mockResolvedValueOnce(new Response('', { status: 401 })).mockImplementationOnce(() => new Promise(resolve => { finishRenewal = resolve; }));
  const { result } = renderHook(useSchedule);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  localStorage.setItem('accessToken', 'another-account-access');
  localStorage.setItem('refreshToken', 'another-account-refresh');
  await act(async () => finishRenewal(new Response('', { status: 401 })));
  expect(result.current.error).toMatch(/Obsolete/);
  expect(localStorage.getItem('accessToken')).toBe('another-account-access');
  expect(localStorage.getItem('refreshToken')).toBe('another-account-refresh');
});
