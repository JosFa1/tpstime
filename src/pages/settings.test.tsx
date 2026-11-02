import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './settings';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useSchedule } from '../hooks/useSchedule';

jest.mock('../components/HamburgerMenu', () => () => null);
jest.mock('../hooks/useSchedule', () => ({ useSchedule: jest.fn() }));
jest.mock('../localPreview', () => ({ localPreview: true }));

const reload = jest.fn();
beforeEach(() => {
  localStorage.clear();
  reload.mockClear();
  (useSchedule as jest.Mock).mockReturnValue({ week: { themes: [] }, loading: false, refreshing: false, error: null, reload });
});
const openSettings = () => render(<ThemeProvider><Settings /></ThemeProvider>);

it('switches categories without losing theme input, disclosures, or class names', () => {
  openSettings();
  expect(screen.getByRole('button', { name: 'Theme' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('textbox', { name: 'Period 1' })).toBeNull();
  fireEvent.change(screen.getByLabelText('Theme Name'), { target: { value: 'Campus theme' } });
  userEvent.click(screen.getByText('Advanced colors'));
  userEvent.click(screen.getByRole('button', { name: 'My classes' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Period 1' }), { target: { value: 'Biology' } });
  userEvent.click(screen.getByRole('button', { name: 'Theme' }));
  expect(screen.getByLabelText('Theme Name')).toHaveValue('Campus theme');
  expect(screen.getByText('Advanced colors').closest('details')).toHaveAttribute('open');
  userEvent.click(screen.getByRole('button', { name: 'My classes' }));
  expect(screen.getByRole('textbox', { name: 'Period 1' })).toHaveValue('Biology');
  expect(JSON.parse(localStorage.getItem('tpstimePreferences')!).personalNames['1']).toBe('Biology');
});

it('keeps display preferences and progress notifications working after category changes and remount', () => {
  const notification = jest.fn();
  window.addEventListener('showProgressBarChanged', notification);
  try {
    const view = openSettings();
    userEvent.click(screen.getByRole('button', { name: 'Display' }));
    userEvent.selectOptions(screen.getByLabelText('Default tab'), 'schedule');
    userEvent.click(screen.getByLabelText('Show progress bar'));
    userEvent.click(screen.getByText('Advanced display options'));
    userEvent.selectOptions(screen.getByLabelText('Time format'), '24h');
    userEvent.click(screen.getByLabelText('Reduce motion'));
    userEvent.click(screen.getByRole('button', { name: 'Theme' }));
    userEvent.click(screen.getByRole('button', { name: 'Display' }));
    expect(screen.getByText('Advanced display options').closest('details')).toHaveAttribute('open');
    expect(screen.getByLabelText('Show progress bar')).not.toBeChecked();
    expect(notification.mock.calls[notification.mock.calls.length - 1][0].detail).toBe(false);
    view.unmount();
    openSettings();
    userEvent.click(screen.getByRole('button', { name: 'Display' }));
    expect(screen.getByLabelText('Default tab')).toHaveValue('schedule');
    expect(screen.getByLabelText('Show progress bar')).not.toBeChecked();
    userEvent.click(screen.getByText('Advanced display options'));
    expect(screen.getByLabelText('Time format')).toHaveValue('24h');
    expect(screen.getByLabelText('Reduce motion')).toBeChecked();
  } finally {
    window.removeEventListener('showProgressBarChanged', notification);
  }
});

it('keeps settings editable and supports retry while school themes fail to load', () => {
  (useSchedule as jest.Mock).mockReturnValue({ week: null, loading: false, refreshing: false, error: 'Offline', reload });
  openSettings();
  expect(screen.getByRole('alert')).toHaveTextContent('Offline');
  userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(reload).toHaveBeenCalledTimes(1);
  userEvent.click(screen.getByRole('button', { name: 'My classes' }));
  expect(screen.getByRole('textbox', { name: 'Period 7' })).toBeEnabled();
});

it.each([false, true])('shows placeholders only while school themes are loading (reduced motion: %s)', reduceMotion => {
  document.documentElement.toggleAttribute('data-reduce-motion', reduceMotion);
  try {
    (useSchedule as jest.Mock).mockReturnValue({ week: null, loading: true, refreshing: true, error: null, reload });
    const view = openSettings();
    expect(screen.getByText('Loading school themes…')).toBeInTheDocument();
    expect(screen.getByLabelText('Theme Name')).toBeEnabled();
    (useSchedule as jest.Mock).mockReturnValue({ week: { themes: [] }, loading: false, refreshing: false, error: null, reload });
    view.rerender(<ThemeProvider><Settings /></ThemeProvider>);
    expect(screen.queryByText('Loading school themes…')).toBeNull();
    expect(screen.getByLabelText('Theme Name')).toBeEnabled();
  } finally {
    document.documentElement.removeAttribute('data-reduce-motion');
  }
});
