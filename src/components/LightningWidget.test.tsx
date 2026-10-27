import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import LightningWidget from './LightningWidget';
import { afterEach } from '@jest/globals';

const originalFetch = global.fetch;
afterEach(() => { cleanup(); global.fetch = originalFetch; jest.useRealTimers(); });

const body = `('${JSON.stringify([{ Name: 'Trinity Prep', widgetData: { hasConnection: 'Up', closestFlash: null, ruleInfo: null, lxAlert: { hasAlerts: false, latitude: 0, longitude: 0, timeStampUtc: '', timeZone: null, countdownhours: 0, countdownmins: 0, countdownsecs: 0, underManualAlert: false, underManualTestAlert: false, utilizeCountdownClock: false, statusText: null } } }])}')`;

it('starts a fresh request after a request timeout and can recover', async () => {
  jest.useFakeTimers();
  let calls = 0;
  global.fetch = jest.fn((_input, init) => {
    calls += 1;
    if (calls > 1) return Promise.resolve(new Response(body));
    return new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  }) as jest.Mock;
  render(<LightningWidget />);

  await act(async () => { jest.advanceTimersByTime(10_000); await Promise.resolve(); });
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByTitle('Official campus Lightning Alert')).toHaveAttribute('src', expect.stringContaining('oas.earthnetworks.com/widget/'));
  await act(async () => { jest.advanceTimersByTime(20_000); await Promise.resolve(); });
  expect(screen.getByText('No alert')).toBeInTheDocument();
  expect(calls).toBe(2);
});

it('aborts an in-flight request when unmounted', () => {
  const fetchMock = jest.fn((_input, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))) as jest.Mock;
  global.fetch = fetchMock;
  const { unmount } = render(<LightningWidget />);
  const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
  unmount();
  expect(signal.aborted).toBe(true);
});

it('retains the last result during a failed poll and makes retries pending', async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn().mockResolvedValueOnce(new Response(body)).mockRejectedValueOnce(new Error('Offline')).mockImplementation(() => new Promise(() => {}));
  render(<LightningWidget />);
  await act(async () => {});
  expect(screen.getByText('No alert')).toBeInTheDocument();
  await act(async () => { jest.advanceTimersByTime(30_000); });
  expect(screen.getByText('Last reported: No alert')).toBeInTheDocument();
  expect(screen.queryByText('No lightning detected near campus.')).not.toBeInTheDocument();
  const retry = screen.getByRole('button', { name: 'Retry' });
  fireEvent.click(retry);
  fireEvent.click(retry);
  expect(screen.getByRole('button', { name: 'Reconnecting…' })).toBeDisabled();
  expect(global.fetch).toHaveBeenCalledTimes(3);
});
