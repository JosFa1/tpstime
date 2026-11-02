import type { SyntheticEvent } from 'react';
import { revealExpandedDetails } from './settingsDisclosure';

let details: HTMLDetailsElement;
const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  details = document.createElement('details');
  details.open = true;
  document.body.append(details);
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callback(0); return 1; });
  jest.spyOn(window, 'scrollBy').mockImplementation(() => {});
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({ getPropertyValue: () => '0ms' } as unknown as CSSStyleDeclaration);
  window.matchMedia = jest.fn(() => ({ matches: false } as MediaQueryList));
});
afterEach(() => {
  details.remove();
  document.documentElement.removeAttribute('data-reduce-motion');
  window.matchMedia = originalMatchMedia;
  jest.restoreAllMocks();
});
const reveal = () => revealExpandedDetails({ currentTarget: details } as SyntheticEvent<HTMLDetailsElement>);
const position = (top: number, bottom: number) => jest.spyOn(details, 'getBoundingClientRect').mockReturnValue({ top, bottom } as DOMRect);

test('does not move a section that already fits', async () => {
  position(100, window.innerHeight - 32);
  await reveal();
  expect(window.scrollBy).not.toHaveBeenCalled();
});

test('waits for expansion before revealing content below the viewport', async () => {
  position(400, window.innerHeight + 100);
  let finish!: () => void;
  const finished = new Promise<void>(resolve => { finish = resolve; });
  details.getAnimations = () => [{ finished } as unknown as Animation];
  const pending = reveal();
  await Promise.resolve();
  expect(window.scrollBy).not.toHaveBeenCalled();
  finish();
  await pending;
  expect(window.scrollBy).toHaveBeenCalledWith({ top: 116, behavior: 'smooth' });
});

test('keeps the heading visible for a section taller than the viewport', async () => {
  position(200, window.innerHeight + 900);
  await reveal();
  expect(window.scrollBy).toHaveBeenCalledWith({ top: 184, behavior: 'smooth' });
});

test('waits for native details transitions that are absent from getAnimations', async () => {
  position(400, window.innerHeight + 100);
  (window.getComputedStyle as jest.Mock).mockReturnValue({ getPropertyValue: () => '240ms' });
  jest.useFakeTimers();
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callback(0); return 1; });
  try {
    const pending = reveal();
    await Promise.resolve();
    jest.advanceTimersByTime(239);
    expect(window.scrollBy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await pending;
    expect(window.scrollBy).toHaveBeenCalledWith({ top: 116, behavior: 'smooth' });
  } finally {
    jest.useRealTimers();
  }
});

test.each(['device', 'setting'])('respects the %s reduced-motion preference', async source => {
  position(400, window.innerHeight + 100);
  if (source === 'device') window.matchMedia = jest.fn(() => ({ matches: true } as MediaQueryList));
  else document.documentElement.setAttribute('data-reduce-motion', '');
  await reveal();
  expect(window.scrollBy).toHaveBeenCalledWith({ top: 116, behavior: 'auto' });
});

test('does not scroll when closed again before expansion finishes', async () => {
  position(400, window.innerHeight + 100);
  const pending = reveal();
  details.open = false;
  await pending;
  expect(window.scrollBy).not.toHaveBeenCalled();
});
