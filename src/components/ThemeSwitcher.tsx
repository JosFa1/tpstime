import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme, ThemeVarKey } from '../contexts/ThemeContext';
import CustomThemePanel from './CustomThemePanel';
import { PublishedTheme } from '../hooks/useSchedule';
import { Skeleton } from './Loading';
import { revealExpandedDetails } from './settingsDisclosure';

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button" aria-pressed={active}
    onClick={onClick}
    className="theme-mode"
  >
    {children}
  </button>
);

const PreviewCard = () => (
  <div className="theme-preview-sample">
    <div className="theme-preview-header">
      <strong>A B C</strong><span>Wed</span>
    </div>
    <div className="theme-preview-clock">
      <strong>12:34</strong><span>Until Math Ends</span>
    </div>
    <div className="theme-preview-footer">
      <span>Period 1</span><span>8:00–8:55</span>
    </div>
  </div>
);

const presetKeys: ThemeVarKey[] = ['color-primary', 'color-secondary', 'color-border', 'color-background', 'color-surface', 'color-text', 'color-text-secondary'];

const ThemeSwitcher: React.FC<{ themes?: PublishedTheme[]; loading?: boolean }> = ({ themes = [], loading = false }) => {
  const { mode, setMode, savedThemes, selectedCustomThemeId, currentVars, addCustomTheme, selectCustomTheme, selectPublishedTheme } = useTheme();
  const presets = [
    { id: 'nord', name: 'Nord', vars: ['#88C0D0','#8FBCBB','#4C566A','#2E3440','#3B4252','#ECEFF4','#D8DEE9'] },
    { id: 'dracula', name: 'Dracula', vars: ['#BD93F9','#FF79C6','#525568','#282A36','#343746','#F8F8F2','#C5C8D6'] },
    { id: 'solarized-dark', name: 'Solarized Dark', vars: ['#2AA198','#268BD2','#586E75','#002B36','#073642','#FDF6E3','#93A1A1'] },
  ];

  return (
    <section className="settings-section theme-settings">
      <div className="theme-overview">
        <div>
          <div className="settings-section-heading"><h2>Theme</h2></div>
          <div className="theme-modes" aria-label="Theme mode">
            <ModeButton active={mode === 'dark'} onClick={() => setMode('dark')}>Dark</ModeButton>
            <ModeButton active={mode === 'system'} onClick={() => setMode('system')}>System</ModeButton>
            <ModeButton active={mode === 'light'} onClick={() => setMode('light')}>Light</ModeButton>
            <ModeButton active={mode === 'custom'} onClick={() => setMode('custom')}>Custom</ModeButton>
          </div>
        </div>
        <div className="theme-preview"><PreviewCard /></div>
      </div>
      {loading && <Skeleton shape="weekdays" label="Loading school themes…" />}

      {themes.some(theme => theme.isEnabled) && <section className="published-themes">
        <h3>School themes</h3>
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
      </section>}

      {/* Custom editor */}
      {mode === 'custom' && (
        <CustomThemePanel />
      )}
      <details className="settings-disclosure" onToggle={revealExpandedDetails}>
        <summary>More themes <ChevronDown size={20} aria-hidden="true" /></summary>
        <div className="theme-presets">
          {presets.map(theme => <button key={theme.id} type="button" className="theme-preset" aria-pressed={mode === 'custom' && theme.vars.every((value, index) => value === currentVars[presetKeys[index]])} onClick={() => {
            try {
              const ids = JSON.parse(localStorage.getItem('builtInThemeIds') || '{}');
              const existing = savedThemes.find(item => item.id === ids[theme.id]);
              if (existing) { selectCustomTheme(existing.id); return; }
            } catch { /* create the preset if its index is unavailable */ }
            const [primary, secondary, border, background, surface, text, textSecondary] = theme.vars;
            const id = addCustomTheme(theme.name, { 'color-primary': primary, 'color-secondary': secondary, 'color-accent': secondary, 'color-border': border, 'color-background': background, 'color-surface': surface, 'color-text': text, 'color-text-secondary': textSecondary });
            try { const ids = JSON.parse(localStorage.getItem('builtInThemeIds') || '{}'); localStorage.setItem('builtInThemeIds', JSON.stringify({ ...ids, [theme.id]: id })); } catch { /* theme itself remains saved */ }
          }}><span className="theme-preset__palette" aria-hidden="true">{[4, 2, 5].map(index => <span key={index} style={{ backgroundColor: theme.vars[index] }} />)}</span><strong>{theme.name}</strong></button>)}
        </div>
      </details>
    </section>
  );
};

export default ThemeSwitcher;
