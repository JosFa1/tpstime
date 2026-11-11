import { readThemeMode, thanksgiving } from './thanksgiving';
import { initializeThemeFromSystemPreference } from './initTheme';

beforeEach(() => localStorage.clear());

test('applies the seasonal update without deleting custom palettes, then preserves the selected mode', () => {
  localStorage.setItem('themeMode', 'custom');
  localStorage.setItem('savedThemes', '[{"id":"personal"}]');
  expect(readThemeMode()).toBe('thanksgiving');
  expect(localStorage.getItem('savedThemes')).toBe('[{"id":"personal"}]');
  localStorage.setItem('themeMode', 'light');
  expect(readThemeMode()).toBe('light');
});

test('initial theme and provider share the Thanksgiving palette', () => {
  initializeThemeFromSystemPreference();
  expect(document.documentElement).toHaveAttribute('data-theme', 'thanksgiving');
  expect(document.documentElement.style.getPropertyValue('--color-background')).toBe(thanksgiving['color-background']);
  localStorage.setItem('themeMode', 'dark');
  initializeThemeFromSystemPreference();
  expect(document.documentElement).toHaveClass('dark');
  expect(document.documentElement.style.getPropertyValue('--color-background')).toBe('');
});
