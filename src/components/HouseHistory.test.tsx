import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import HouseHistory from './HouseHistory';

const history = [
  { publishedAt: '2026-10-20T16:00:00Z', scores: { hay: 100, brokaw: 90 } },
  { publishedAt: '2026-10-27T16:00:00Z', scores: { hay: 100, brokaw: 110 } },
];

test('highlights a house from its legend and shows point details on focus', () => {
  render(<HouseHistory history={history} />);
  const legend = screen.getByRole('button', { name: 'Highlight Hay' });
  fireEvent.mouseEnter(legend);
  expect(legend).toHaveAttribute('aria-pressed', 'true');
  const point = screen.getByRole('button', { name: 'Brokaw: 110 points, Oct 27, 2026' });
  fireEvent.keyDown(point, { key: 'Enter' });
  expect(screen.getByText('110 points · Oct 27, 2026')).toBeInTheDocument();
  expect(screen.queryByText('View points by update')).toBeNull();
});

test('explains when no history is available', () => {
  render(<HouseHistory history={[]} />);
  expect(screen.getByText('No published house points history is available yet.')).toBeInTheDocument();
});
