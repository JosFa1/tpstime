import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Houses from './houses';
import { useSchedule } from '../hooks/useSchedule';

jest.mock('../components/HamburgerMenu', () => () => null);
jest.mock('../hooks/useSchedule', () => ({ useSchedule: jest.fn() }));
const mockedSchedule = useSchedule as jest.Mock;
const week = (hay: number, maughan: number) => ({ days: [], quickLinks: [
  { icon: 'house:hay', label: 'Hay', sortOrder: hay },
  { icon: 'house:maughan', label: 'Maughan', sortOrder: maughan },
] });
const result = (data: ReturnType<typeof week> & { previousHousePoints?: ReturnType<typeof week>["quickLinks"] }) => ({ week: data, loading: false, error: null, refreshing: false, reload: jest.fn() });

beforeEach(() => localStorage.clear());

test('shows published movement for a new visitor and after reopening', () => {
  const previous = week(10, 5).quickLinks;
  mockedSchedule.mockReturnValue(result({ ...week(10, 15), previousHousePoints: previous }));
  const view = render(<Houses />);
  expect(within(screen.getByRole('heading', { name: /Maughan/ }).parentElement!).getByLabelText('Up 1 place since the last house points update')).toBeInTheDocument();
  expect(within(screen.getByRole('heading', { name: /Hay/ }).parentElement!).getByLabelText('Down 1 place since the last house points update')).toBeInTheDocument();
  view.unmount();
  render(<Houses />);
  expect(screen.getByLabelText('Up 1 place since the last house points update')).toBeInTheDocument();
});

test('does not claim movement without a previous published score', () => {
  mockedSchedule.mockReturnValue(result(week(10, 5)));
  render(<Houses />);
  expect(screen.queryByLabelText(/since the last house points update/)).toBeNull();
});
