import type { SyntheticEvent } from 'react';

export async function revealExpandedDetails(event: SyntheticEvent<HTMLDetailsElement>) {
  const details = event.currentTarget;
  if (!details.open) return;
  await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
  if (!details.open || !details.isConnected) return;
  const reduceMotion = document.documentElement.hasAttribute('data-reduce-motion') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const waits: Promise<unknown>[] = (details.getAnimations?.({ subtree: true }) ?? []).map(animation => animation.finished);
  // Native details-content transitions are not included in getAnimations().
  const timing = getComputedStyle(details).getPropertyValue('--settings-reveal-duration').trim();
  const duration = reduceMotion ? 0 : (parseFloat(timing) || 0) * (timing.endsWith('ms') ? 1 : 1000);
  if (duration > 0) waits.push(new Promise<void>(resolve => window.setTimeout(resolve, duration)));
  await Promise.allSettled(waits);
  if (!details.open || !details.isConnected) return;

  const rect = details.getBoundingClientRect();
  const overflow = rect.bottom - window.innerHeight + 16;
  // Keep the heading visible when an expanded section is taller than the viewport.
  const distance = Math.min(overflow, Math.max(0, rect.top - 16));
  if (distance <= 0) return;
  window.scrollBy({ top: distance, behavior: reduceMotion ? 'auto' : 'smooth' });
}
