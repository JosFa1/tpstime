import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import CustomThemePanel from './CustomThemePanel';
import { PublishedTheme } from '../hooks/useSchedule';
import { localPreview } from '../localPreview';
import { Skeleton } from './Loading';

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button" aria-pressed={active}
    onClick={onClick}
    className="theme-mode"
  >
    {children}
  </button>
);

const PreviewCard: React.FC<{ title?: string }> = ({ title }) => (
  <div className="w-64 h-36 rounded-lg border-2 flex flex-col justify-between shadow transition-all duration-200 mx-auto mb-4"
       style={{
         background: 'var(--color-background)',
         color: 'var(--color-text)',
         borderColor: 'var(--color-primary)'
       }}>
    <div className="flex flex-row justify-between px-3 pt-3">
      <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{title ?? 'A B C'}</span>
      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Wed</span>
    </div>
    <div className="flex flex-col items-center justify-center flex-1">
      <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>12:34</span>
      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Until Math Ends</span>
    </div>
    <div className="flex flex-row justify-between px-3 pb-3">
      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Period 1</span>
      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>8:00-8:55</span>
    </div>
  </div>
);

const ThemeSwitcher: React.FC<{ themes?: PublishedTheme[]; loading?: boolean }> = ({ themes = [], loading = false }) => {
  const { mode, setMode, savedThemes, selectedCustomThemeId, addCustomTheme, selectCustomTheme, selectPublishedTheme } = useTheme();
  const presets = [
    { id: 'nord', name: 'Nord', vars: ['#88C0D0','#8FBCBB','#4C566A','#2E3440','#3B4252','#ECEFF4','#D8DEE9'] },
    { id: 'dracula', name: 'Dracula', vars: ['#BD93F9','#FF79C6','#525568','#282A36','#343746','#F8F8F2','#C5C8D6'] },
    { id: 'solarized-dark', name: 'Solarized Dark', vars: ['#2AA198','#268BD2','#586E75','#002B36','#073642','#FDF6E3','#93A1A1'] },
  ];

  return (
    <section className="settings-card theme-settings">
      <div className="settings-section-heading"><h2>Theme</h2></div>

      {/* Mode selection */}
      <div className="theme-modes" aria-label="Theme mode">
        <ModeButton active={mode === 'dark'} onClick={() => setMode('dark')}>Dark</ModeButton>
        <ModeButton active={mode === 'system'} onClick={() => setMode('system')}>System</ModeButton>
        <ModeButton active={mode === 'light'} onClick={() => setMode('light')}>Light</ModeButton>
        <ModeButton active={mode === 'custom'} onClick={() => setMode('custom')}>Custom</ModeButton>
      </div>

      <div className="theme-preview"><strong>Live preview</strong><PreviewCard /></div>
      {loading && <Skeleton shape="weekdays" label="Loading school themes…" />}

      {(localPreview || themes.some(theme => theme.isEnabled)) && <section className="published-themes">
        <h4>School themes</h4>
        <div>{themes.filter(theme => theme.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder).map(theme =>
          <button key={theme.id} type="button" aria-pressed={mode === 'custom' && selectedCustomThemeId === `published-${theme.id}`} onClick={() => {
            const t = theme.tokens;
            selectPublishedTheme(theme.id, theme.name, {
              'color-primary': t.accent, 'color-secondary': t.accent, 'color-accent': t.accent,
              'color-background': t.background, 'color-surface': t.surface, 'color-text': t.primaryText,
              'color-text-secondary': t.secondaryText, 'color-border': t.border,
              'color-success': t.success, 'color-warning': t.warning, 'color-error': t.error,
            });
          }} style={{ backgroundColor: theme.tokens.background, color: theme.tokens.primaryText, borderColor: theme.tokens.border }}>{theme.name}</button>)}</div>
        {localPreview && !themes.length && <p>School themes are available when signed in on the live site.</p>}
      </section>}

      {/* Custom editor */}
      {mode === 'custom' && (
        <div className="mt-4">
          <CustomThemePanel />
        </div>
      )}
      <details className="settings-disclosure">
        <summary>More themes <ChevronDown size={20} aria-hidden="true" /></summary>
        <div className="theme-presets">
          {presets.map(theme => <button key={theme.id} className="theme-preset" style={{ backgroundColor: theme.vars[3], color: theme.vars[5], borderColor: theme.vars[2] }} onClick={() => {
            try {
              const ids = JSON.parse(localStorage.getItem('builtInThemeIds') || '{}');
              const existing = savedThemes.find(item => item.id === ids[theme.id]);
              if (existing) { selectCustomTheme(existing.id); return; }
            } catch { /* create the preset if its index is unavailable */ }
            const [primary, secondary, border, background, surface, text, textSecondary] = theme.vars;
            const id = addCustomTheme(theme.name, { 'color-primary': primary, 'color-secondary': secondary, 'color-accent': secondary, 'color-border': border, 'color-background': background, 'color-surface': surface, 'color-text': text, 'color-text-secondary': textSecondary });
            try { const ids = JSON.parse(localStorage.getItem('builtInThemeIds') || '{}'); localStorage.setItem('builtInThemeIds', JSON.stringify({ ...ids, [theme.id]: id })); } catch { /* theme itself remains saved */ }
          }}><span className="theme-preset__preview" style={{ backgroundColor: theme.vars[4], color: theme.vars[0] }}>12:34</span><strong>{theme.name}</strong><span className="theme-preset__swatches" aria-hidden="true"><i style={{ backgroundColor: theme.vars[0] }} /><i style={{ backgroundColor: theme.vars[1] }} /><i style={{ backgroundColor: theme.vars[4] }} /></span></button>)}
        </div>
      </details>
    </section>
  );
};

export default ThemeSwitcher;
