import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

test('offers enabled published themes and applies their actual colors', async () => {
  localStorage.clear();
  const themeColor = document.createElement('meta');
  themeColor.name = 'theme-color';
  document.head.appendChild(themeColor);
  const tokens = { accent: '#00E5FF', background: '#010205', surface: '#090B10', primaryText: '#FFFFFF', secondaryText: '#B8C0CC', border: '#242936', success: '#3DDC97', warning: '#FFD166', error: '#FF5D73' };
  render(<ThemeProvider><ThemeSwitcher themes={[
    { id: 'ultradark', name: 'Ultra Dark', tokens, isEnabled: true, sortOrder: 0 },
    { id: 'disabled', name: 'Disabled theme', tokens, isEnabled: false, sortOrder: 1 },
  ]} /></ThemeProvider>);
  expect(screen.queryByRole('button', { name: 'Disabled theme' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Ultra Dark' }));
  await waitFor(() => expect(document.documentElement.style.getPropertyValue('--color-background')).toBe('#010205'));
  expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#00E5FF');
  expect(screen.getByRole('button', { name: 'Ultra Dark' })).toHaveAttribute('aria-pressed', 'true');
  expect(themeColor.content).toBe('#010205');
  themeColor.remove();
});

test('derives supporting colors when main custom colors change and keeps error unchanged', async () => {
  localStorage.clear();
  render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
  const error = document.documentElement.style.getPropertyValue('--color-error');
  fireEvent.change(screen.getByLabelText('Primary'), { target: { value: '#123456' } });
  fireEvent.change(screen.getByLabelText('Surface'), { target: { value: '#000000' } });
  fireEvent.change(screen.getByLabelText('Text'), { target: { value: '#ffffff' } });
  await waitFor(() => expect(document.documentElement.style.getPropertyValue('--color-border')).toBe('#212121'));
  expect(document.documentElement.style.getPropertyValue('--color-text-secondary')).toBe('#ababab');
  expect(document.documentElement.style.getPropertyValue('--color-secondary')).toBe('#123456');
  expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#123456');
  expect(document.documentElement.style.getPropertyValue('--color-error')).toBe(error);
  expect(screen.queryByLabelText('Error')).toBeNull();
});

test('derives muted text and borders for the supplied dark palette', async () => {
  localStorage.clear();
  render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
  fireEvent.change(screen.getByLabelText('Background'), { target: { value: '#121212' } });
  fireEvent.change(screen.getByLabelText('Surface'), { target: { value: '#1e1e1e' } });
  fireEvent.change(screen.getByLabelText('Text'), { target: { value: '#e0e0e0' } });
  await waitFor(() => expect(document.documentElement.style.getPropertyValue('--color-text-secondary')).toBe('#a0a0a0'));
  expect(document.documentElement.style.getPropertyValue('--color-border')).toBe('#373737');
});

test('keeps adaptive text readable on both light surfaces', async () => {
  localStorage.clear();
  render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
  fireEvent.change(screen.getByLabelText('Background'), { target: { value: '#ffffff' } });
  fireEvent.change(screen.getByLabelText('Surface'), { target: { value: '#f5f5f5' } });
  fireEvent.change(screen.getByLabelText('Text'), { target: { value: '#212121' } });
  await waitFor(() => expect(document.documentElement.style.getPropertyValue('--color-text-secondary')).toBe('#676767'));
});
