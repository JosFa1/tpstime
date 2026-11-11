
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';
import { readThemeMode, thanksgiving } from '../theme/thanksgiving';

// Theme mode for the app
export type ThemeMode = 'thanksgiving' | 'system' | 'light' | 'dark' | 'custom';

// Keys for CSS variables that define theme
export type ThemeVarKey =
  | 'color-primary'
  | 'color-secondary'
  | 'color-accent'
  | 'color-background'
  | 'color-surface'
  | 'color-text'
  | 'color-text-secondary'
  | 'color-border'
  | 'color-error'
  | 'color-warning'
  | 'color-success';

export type ThemeVars = Record<ThemeVarKey, string>;

export interface CustomTheme {
  id: string;
  name: string;
  vars: ThemeVars;
}

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;

  // Saved custom themes
  savedThemes: CustomTheme[];
  selectedCustomThemeId: string | null;
  selectCustomTheme: (id: string) => void;
  selectPublishedTheme: (id: string, name: string, vars: ThemeVars) => void;
  addCustomTheme: (name?: string, base?: Partial<ThemeVars>) => string; // returns new id
  renameCustomTheme: (id: string, name: string) => void;
  deleteCustomTheme: (id: string) => void;
  resetCustomThemes: () => void;

  // Update variables for currently selected custom theme
  updateVar: (key: ThemeVarKey, value: string) => void;
  currentVars: ThemeVars; // resolved current vars (custom or active base)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Helper: basic palettes
const lightBase: ThemeVars = {
  'color-primary': '#1976d2',
  'color-secondary': '#90caf9',
  'color-accent': '#e3f2fd',
  'color-background': '#f5f5f5',
  'color-surface': '#ffffff',
  'color-text': '#212121',
  'color-text-secondary': '#757575',
  'color-border': '#e0e0e0',
  'color-error': '#d32f2f',
  'color-warning': '#ffa000',
  'color-success': '#388e3c',
};

const darkBase: ThemeVars = {
  'color-primary': '#bb86fc',
  'color-secondary': '#bb86fc',
  'color-accent': '#bb86fc',
  'color-background': '#121212',
  'color-surface': '#1e1e1e',
  'color-text': '#e0e0e0',
  'color-text-secondary': '#a0a0a0',
  'color-border': '#383838',
  'color-error': '#ff6464',
  'color-warning': '#ffae00',
  'color-success': '#10c50d',
};

// Seed custom themes per user request
const seededCustomThemes: CustomTheme[] = [
  {
    id: 'hay',
    name: 'Hay',
    vars: {
      'color-primary': '#FDB414', // Gold
      'color-secondary': '#1976D2', // Blue
      'color-accent': '#8d37cbff', // Light Blue
      'color-background': '#002C5C', // Deep Blue
      'color-surface': '#0D3F7A',
      'color-text': '#FDB414',
      'color-text-secondary': '#90CAF9',
      'color-border': '#90CAF9',
      'color-error': '#ff6464',
      'color-warning': '#ffae00',
      'color-success': '#10c50d',
    },
  },
  {
    id: 'ellis',
    name: 'Ellis',
    vars: {
      'color-primary': '#3eb744ff', // Green
      'color-secondary': '#1976D2', // Blue
      'color-accent': '#154d75ff', // Light Blue/White
      'color-background': '#102A43',
      'color-surface': '#1B3A4B',
      'color-text': '#E0F7FA',
      'color-text-secondary': '#B2EBF2',
      'color-border': '#1976D2',
      'color-error': '#ff6464',
      'color-warning': '#ffae00',
      'color-success': '#10c50d',
    },
  },
  {
    id: 'maughan',
    name: 'Maughan',
    vars: {
      'color-primary': '#9c45d2ff', // Purple
      'color-secondary': '#D32F2F', // Red
      'color-accent': '#FDB414', // Gold
      'color-background': '#2A1B2E',
      'color-surface': '#4B2E46',
      'color-text': '#FFF0F5',
      'color-text-secondary': '#FFD1DC',
      'color-border': '#9c45d2ff',
      'color-error': '#ff6464',
      'color-warning': '#ffae00',
      'color-success': '#10c50d',
    },
  },
  {
    id: 'brokaw',
    name: 'Brokaw',
    vars: {
      'color-primary': '#D32F2F', // Red
      'color-secondary': '#824732ff', // Black-ish
      'color-accent': '#FDB414', // Gold
      'color-background': '#121212',
      'color-surface': '#1E1E1E',
      'color-text': '#E0E0E0',
      'color-text-secondary': '#BDBDBD',
      'color-border': '#333333',
      'color-error': '#ff6464',
      'color-warning': '#ffae00',
      'color-success': '#10c50d',
    },
  },
  {
    id: 'lawson',
    name: 'Lawson',
    vars: {
      'color-primary': '#8BC34A', // Light Green
      'color-secondary': '#5e7d8fff', // Grey
      'color-accent': '#FDB414', // Gold
      'color-background': '#1E1E1E',
      'color-surface': '#2A2A2A',
      'color-text': '#E0E0E0',
      'color-text-secondary': '#BDBDBD',
      'color-border': '#616161',
      'color-error': '#ff6464',
      'color-warning': '#ffae00',
      'color-success': '#10c50d',
    },
  },
  {
    id: 'st-john',
    name: 'St. John',
    vars: {
      'color-primary': '#39b841ff', // Dark Green
      'color-secondary': '#795548', // Brown
      'color-accent': '#ae7241ff', // Grey
      'color-background': '#1B2E1B',
      'color-surface': '#2E4632',
      'color-text': '#E9F5DB',
      'color-text-secondary': '#c9b9a8ff',
      'color-border': '#616161',
      'color-error': '#ff6464',
      'color-warning': '#ffae00',
      'color-success': '#10c50d',
    },
  },
];

// LocalStorage keys
const LS_KEYS = {
  MODE: 'themeMode',
  SAVED: 'savedThemes',
  SELECTED_CUSTOM_ID: 'selectedCustomThemeId',
};

// Utility to write vars to :root
function applyVars(vars: ThemeVars) {
  const root = document.documentElement;
  (Object.keys(vars) as ThemeVarKey[]).forEach((k) => {
    root.style.setProperty(`--${k}`, vars[k]);
  });
}

// Utility to remove inline vars (fall back to CSS)
function clearInlineVars() {
  const root = document.documentElement as HTMLElement & { style: CSSStyleDeclaration };
  const keys: ThemeVarKey[] = [
    'color-primary','color-secondary','color-accent','color-background','color-surface','color-text','color-text-secondary','color-border','color-error','color-warning','color-success'
  ];
  keys.forEach((k) => root.style.removeProperty(`--${k}`));
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load from storage
  const [mode, setModeState] = useState<ThemeMode>(readThemeMode);

  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.SAVED);
      if (raw) return JSON.parse(raw) as CustomTheme[];
    } catch {}
    // seed with provided themes
    return seededCustomThemes;
  });

  const [selectedCustomThemeId, setSelectedCustomThemeId] = useState<string | null>(() => {
    return localStorage.getItem(LS_KEYS.SELECTED_CUSTOM_ID) || (seededCustomThemes[0]?.id ?? null);
  });

  const selectedCustomTheme = useMemo(() => savedThemes.find(t => t.id === selectedCustomThemeId) || savedThemes[0] || null, [savedThemes, selectedCustomThemeId]);

  // Derived current vars based on mode
  const currentVars: ThemeVars = useMemo(() => {
    if (mode === 'thanksgiving') return thanksgiving;
    if (mode === 'light') return lightBase;
    if (mode === 'dark') return darkBase;
    if (mode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkBase : lightBase;
    }
    // custom
    return selectedCustomTheme?.vars || lightBase;
  }, [mode, selectedCustomTheme]);

  // Apply mode and variables to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-custom-theme', mode === 'custom' ? selectedCustomTheme?.id ?? '' : '');
    const updateThemeColor = (color: string) => document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    updateThemeColor(currentVars['color-background']);
    // reset base attributes
    root.classList.remove('dark');
    root.removeAttribute('data-theme');

    if (mode === 'dark') {
      root.classList.add('dark');
      clearInlineVars();
    } else if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
      clearInlineVars();
    } else if (mode === 'system') {
      // Follow system
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = () => {
        root.classList.remove('dark');
        root.removeAttribute('data-theme');
        if (mq.matches) {
          root.classList.add('dark');
        } else {
          root.setAttribute('data-theme', 'light');
        }
        clearInlineVars();
        updateThemeColor((mq.matches ? darkBase : lightBase)['color-background']);
      };
      apply();
      const handler = () => apply();
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
      return () => {
        mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler as any);
      };
    } else {
      root.setAttribute('data-theme', mode);
      applyVars(currentVars);
    }
  }, [mode, currentVars, selectedCustomTheme?.id]);

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.SAVED, JSON.stringify(savedThemes));
  }, [savedThemes]);

  useEffect(() => {
    if (selectedCustomThemeId) localStorage.setItem(LS_KEYS.SELECTED_CUSTOM_ID, selectedCustomThemeId);
  }, [selectedCustomThemeId]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
  }, []);

  const selectCustomTheme = useCallback((id: string) => {
    setSelectedCustomThemeId(id);
    setModeState('custom');
  }, []);

  const selectPublishedTheme = useCallback((id: string, name: string, vars: ThemeVars) => {
    const theme = { id: `published-${id}`, name, vars };
    setSavedThemes(prev => [...prev.filter(item => item.id !== theme.id), theme]);
    setSelectedCustomThemeId(theme.id);
    setModeState('custom');
  }, []);

  const addCustomTheme = useCallback((name?: string, base?: Partial<ThemeVars>) => {
    const id = `custom-${Date.now()}`;
    const newTheme: CustomTheme = {
      id,
      name: name?.trim() || 'New Theme',
      vars: { ...lightBase, ...(base || {}) },
    };
    setSavedThemes((prev) => [...prev, newTheme]);
    setSelectedCustomThemeId(id);
    setModeState('custom');
    return id;
  }, []);

  const renameCustomTheme = useCallback((id: string, name: string) => {
    setSavedThemes((prev) => prev.map(t => (t.id === id ? { ...t, name } : t)));
  }, []);

  const deleteCustomTheme = useCallback((id: string) => {
    setSavedThemes((prev) => prev.filter(t => t.id !== id));
    setSelectedCustomThemeId((curr) => (curr === id ? null : curr));
  }, []);

  const resetCustomThemes = useCallback(() => {
    setSavedThemes(seededCustomThemes);
    setSelectedCustomThemeId(seededCustomThemes[0]?.id ?? null);
  }, []);

  const updateVar = useCallback((key: ThemeVarKey, value: string) => {
    if (!selectedCustomTheme) return;
    setSavedThemes((prev) => prev.map(t => {
      if (t.id !== selectedCustomTheme.id) return t;
      const vars = { ...t.vars, [key]: value };
      if (key === 'color-primary') { vars['color-secondary'] = value; vars['color-accent'] = value; }
      if (key === 'color-text' || key === 'color-surface' || key === 'color-background') {
        const mix = (a: string, b: string, weight: number) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * weight + parseInt(b.slice(i, i + 2), 16) * (1 - weight)).toString(16).padStart(2, '0')).join('');
        const luminance = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
        const contrast = (a: string, b: string) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
        const needsContrast = (candidate: string) => [vars['color-surface'], vars['color-background']].some(bg => contrast(candidate, bg) < 4.5 && contrast(vars['color-text'], bg) >= 4.5);
        let weight = 0.67;
        let secondary = mix(vars['color-text'], vars['color-surface'], weight);
        while (weight < 1 && needsContrast(secondary)) {
          weight = Math.min(1, weight + 0.01);
          secondary = mix(vars['color-text'], vars['color-surface'], weight);
        }
        vars['color-text-secondary'] = secondary;
        vars['color-border'] = mix(vars['color-text'], vars['color-surface'], 0.13);
      }
      return { ...t, vars };
    }));
    // Live-apply while editing
    if (mode === 'custom') {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  }, [mode, selectedCustomTheme]);

  const contextValue: ThemeContextType = {
    mode,
    setMode,
    savedThemes,
    selectedCustomThemeId,
    selectCustomTheme,
    selectPublishedTheme,
    addCustomTheme,
    renameCustomTheme,
    deleteCustomTheme,
    resetCustomThemes,
    updateVar,
    currentVars,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
