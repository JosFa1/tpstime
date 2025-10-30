
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';

// Theme mode for the app
export type ThemeMode = 'dark' | 'system' | 'light' | 'custom';

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
  'color-primary': '#90caf9',
  'color-secondary': '#cbcbcb',
  'color-accent': '#b3e5fc',
  'color-background': '#181A20',
  'color-surface': '#23272F',
  'color-text': '#cbcbcb',
  'color-text-secondary': '#b0b0b0',
  'color-border': '#333A47',
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
      'color-accent': '#90CAF9', // Light Blue
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
      'color-primary': '#2E7D32', // Green
      'color-secondary': '#1976D2', // Blue
      'color-accent': '#E3F2FD', // Light Blue/White
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
      'color-primary': '#6A1B9A', // Purple
      'color-secondary': '#D32F2F', // Red
      'color-accent': '#FDB414', // Gold
      'color-background': '#2A1B2E',
      'color-surface': '#4B2E46',
      'color-text': '#FFF0F5',
      'color-text-secondary': '#FFD1DC',
      'color-border': '#6A1B9A',
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
      'color-secondary': '#212121', // Black-ish
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
      'color-secondary': '#9E9E9E', // Grey
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
      'color-primary': '#1B5E20', // Dark Green
      'color-secondary': '#795548', // Brown
      'color-accent': '#9E9E9E', // Grey
      'color-background': '#1B2E1B',
      'color-surface': '#2E4632',
      'color-text': '#E9F5DB',
      'color-text-secondary': '#B7C9A8',
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
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = (localStorage.getItem(LS_KEYS.MODE) as ThemeMode) || 'dark';
    return saved;
  });

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
      };
      apply();
      const handler = () => apply();
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
      return () => {
        mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler as any);
      };
    } else {
      // custom
      root.setAttribute('data-theme', 'custom');
      applyVars(currentVars);
    }
  }, [mode, currentVars]);

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
    setSavedThemes((prev) => prev.map(t => (t.id === selectedCustomTheme.id ? { ...t, vars: { ...t.vars, [key]: value } } : t)));
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