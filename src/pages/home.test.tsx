import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './home';
import { useSchedule } from '../hooks/useSchedule';
import Weekdays from '../components/weekdays';

jest.mock('../hooks/useSchedule', () => ({ ...jest.requireActual('../hooks/useSchedule'), useSchedule: jest.fn() }));
jest.mock('../components/WhatsNew', () => () => null);
jest.mock('../contexts/ThemeContext', () => ({ useTheme: () => ({ mode: 'dark', selectedCustomThemeId: null }) }));
jest.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn(), user: null }) }));
jest.mock('../components/weekdays', () => ({ __esModule: true, default: jest.fn(jest.requireActual('../components/weekdays').default) }));
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ({ pathname: '/' }), useNavigate: () => () => {},
  Link: ({ to, ...props }: { to: string }) => require('react').createElement('a', { href: to, ...props }),
}), { virtual: true });

const day = { date: '2026-10-26', marker: { code: 'A', name: 'A Day', isSchoolDay: true }, blocks: [{ name: 'Biology', period: '1', startTime: '00:00', endTime: '23:59', sortOrder: 0 }] };
const loaded = { week: { days: [day], quickLinks: [] }, loading: false, refreshing: false, error: null, reload: jest.fn() };
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-26T14:00:00Z'));
  localStorage.clear();
  (useSchedule as jest.Mock).mockReturnValue(loaded);
  (Weekdays as jest.Mock).mockClear();
  (Weekdays as jest.Mock).mockImplementation(jest.requireActual('../components/weekdays').default);
});
afterEach(() => jest.useRealTimers());
const openHome = () => render(<MemoryRouter><Home /></MemoryRouter>);

it('shows content-shaped loading states instead of empty or misleading instructions', () => {
  (useSchedule as jest.Mock).mockReturnValue({ ...loaded, week: null, loading: true, refreshing: true });
  openHome();
  expect(screen.getByText('Loading today’s schedule…')).toBeInTheDocument();
  expect(document.title).toBe('TPSTime');
  fireEvent.click(screen.getByRole('tab', { name: 'Schedule' }));
  expect(screen.getByText('Loading schedule…')).toBeInTheDocument();
  expect(screen.queryByText(/Select a weekday/)).not.toBeInTheDocument();
});

it('distinguishes errors, unpublished days, empty classes, and no school', () => {
  (useSchedule as jest.Mock).mockReturnValue({ ...loaded, week: null, error: 'Offline' });
  const view = openHome();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(loaded.reload).toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('Offline');
  (useSchedule as jest.Mock).mockReturnValue({ ...loaded, week: { days: [], quickLinks: [] } });
  view.rerender(<MemoryRouter><Home /></MemoryRouter>);
  expect(screen.getByText('No schedule has been published for today.')).toBeInTheDocument();
  (useSchedule as jest.Mock).mockReturnValue({ ...loaded, week: { days: [{ ...day, blocks: [] }], quickLinks: [] } });
  fireEvent.click(screen.getByRole('tab', { name: 'Schedule' }));
  expect(screen.getByText('No classes have been published for this day.')).toBeInTheDocument();
  (useSchedule as jest.Mock).mockReturnValue({ ...loaded, week: { days: [{ ...day, marker: { ...day.marker, isSchoolDay: false } }], quickLinks: [] } });
  fireEvent.click(screen.getByRole('tab', { name: 'Timer' }));
  expect(screen.getByText('No school today')).toBeInTheDocument();
});

it('moves tab focus with arrows and activates with Enter', () => {
  openHome();
  const timer = screen.getByRole('tab', { name: 'Timer' });
  const schedule = screen.getByRole('tab', { name: 'Schedule' });
  act(() => timer.focus());
  fireEvent.keyDown(timer, { key: 'ArrowRight' });
  expect(schedule).toHaveFocus();
  expect(timer).toHaveAttribute('aria-selected', 'true');
  userEvent.keyboard('{Enter}');
  expect(schedule).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel', { name: 'Schedule' })).toBeVisible();
});

it('does not rerender Home navigation on progress ticks and stops progress work outside Timer', () => {
  openHome();
  const initialRenders = (Weekdays as jest.Mock).mock.calls.length;
  const timerCount = jest.getTimerCount();
  act(() => jest.advanceTimersByTime(3000));
  expect((Weekdays as jest.Mock).mock.calls.length).toBe(initialRenders);
  fireEvent.click(screen.getByRole('tab', { name: 'Schedule' }));
  expect(jest.getTimerCount()).toBeLessThan(timerCount);
});


it('shows the compact timer and progress when switching to schedule', () => {
  openHome();
  expect(screen.queryByLabelText('Current class timer')).toBeNull();
  fireEvent.click(screen.getByRole('tab', { name: 'Schedule' }));
  expect(screen.getByLabelText('Current class timer')).toHaveTextContent('Biology');
  expect(screen.getByRole('progressbar', { name: 'Current class progress' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Timer' }));
  expect(screen.queryByLabelText('Current class timer')).toBeNull();
});
