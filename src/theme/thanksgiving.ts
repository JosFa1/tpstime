import type { ThemeMode, ThemeVars } from '../contexts/ThemeContext';

export const thanksgiving: ThemeVars = {
  'color-primary': '#f7b267',
  'color-secondary': '#e58c52',
  'color-accent': '#eac779',
  'color-background': '#24170f',
  'color-surface': '#352319',
  'color-text': '#fff3e2',
  'color-text-secondary': '#d6b99e',
  'color-border': '#79583e',
  'color-error': '#ff9292',
  'color-warning': '#eac779',
  'color-success': '#b6ce88',
};

export function readThemeMode(): ThemeMode {
  // Apply the seasonal update once, then keep the user's next choice.
  if (!localStorage.getItem('tpstime-thanksgiving-2026')) {
    localStorage.setItem('themeMode', 'thanksgiving');
    localStorage.setItem('tpstime-thanksgiving-2026', 'applied');
  }
  const saved = localStorage.getItem('themeMode');
  return saved === 'system' || saved === 'light' || saved === 'dark' || saved === 'custom' ? saved : 'thanksgiving';
}
