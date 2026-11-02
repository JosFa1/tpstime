import React, { useMemo, useState } from 'react';
import { ChevronDown, Pipette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeVarKey } from '../contexts/ThemeContext';
import { revealExpandedDetails } from './settingsDisclosure';

const groups: Array<{ title: string; keys: { key: ThemeVarKey; label: string }[] }> = [
  { title: 'Main colors', keys: [
    { key: 'color-background', label: 'Background' },
    { key: 'color-surface', label: 'Surface' },
    { key: 'color-text', label: 'Text' },
    { key: 'color-primary', label: 'Primary' },
  ] },
  { title: 'Fine-tune colors', keys: [
    { key: 'color-secondary', label: 'Secondary' },
    { key: 'color-accent', label: 'Accent' },
    { key: 'color-text-secondary', label: 'Text Secondary' },
    { key: 'color-border', label: 'Border' },
    { key: 'color-warning', label: 'Warning' },
    { key: 'color-success', label: 'Success' },
  ] },
];

const CustomThemePanel: React.FC = () => {
  const {
    savedThemes,
    selectedCustomThemeId,
    selectCustomTheme,
    addCustomTheme,
    renameCustomTheme,
    deleteCustomTheme,
    resetCustomThemes,
    updateVar,
  } = useTheme();

  const selected = useMemo(() => savedThemes.find(t => t.id === selectedCustomThemeId) || savedThemes[0], [savedThemes, selectedCustomThemeId]);
  const [name, setName] = useState<string>(selected?.name || '');

  React.useEffect(() => {
    setName(selected?.name || '');
  }, [selected?.id, selected?.name]);

  const onDelete = () => {
    if (!selected) return;
    const sure = window.confirm(`Delete theme "${selected.name}"? This cannot be undone.`);
    if (sure) deleteCustomTheme(selected.id);
  };

  const onResetAll = () => {
    const sure = window.confirm('Remove all custom themes and restore defaults?');
    if (sure) resetCustomThemes();
  };

  return (
    <div className="custom-theme-editor">
      <div className="custom-theme-toolbar">
        <div className="custom-theme-field">
          <label htmlFor="saved-theme" className="saved-themes-label">Saved themes</label>
          <span className="settings-select">
            <select
              id="saved-theme"
              value={selected?.id || ''}
              onChange={(e) => selectCustomTheme(e.target.value)}
            >
              {savedThemes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={18} aria-hidden="true" />
          </span>
        </div>
        <div className="custom-theme-actions">
          <button
            onClick={() => addCustomTheme('New Theme', selected?.vars)}
            type="button" className="settings-button"
          >
            Add
          </button>
          <button
            onClick={onDelete}
            type="button" className="settings-button settings-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Rename */}
      <div className="custom-theme-field">
        <label htmlFor="theme-name">Theme Name</label>
        <span className="settings-input">
          <input
            id="theme-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => selected && renameCustomTheme(selected.id, name.trim() || selected.name)}
            placeholder="My Theme"
          />
        </span>
      </div>

      {/* Color pickers */}
      <div>
        {groups.slice(0, 1).map((g) => (
          <fieldset key={g.title} className="theme-color-group">
            <legend>{g.title}</legend>
            <div className="theme-colors">
              {g.keys.map(({ key, label }) => (
                <label key={key}>
                  <span>{label}</span>
                  <span className="theme-color-control" title={`Change ${label.toLowerCase()} color`}>
                    <input
                      type="color"
                      value={selected?.vars?.[key] || '#ffffff'}
                      onChange={(e) => updateVar(key, e.target.value)}
                      aria-label={label}
                    />
                    <Pipette size={16} aria-hidden="true" />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <details className="settings-disclosure" onToggle={revealExpandedDetails}>
        <summary>Advanced colors <ChevronDown size={20} aria-hidden="true" /></summary>
        <div>
          {groups.slice(1).map((g) => (
            <fieldset key={g.title} className="theme-color-group">
              <legend className="sr-only">{g.title}</legend>
              <div className="theme-colors theme-colors--advanced">
                {g.keys.map(({ key, label }) => <label key={key}>
                  <span>{label}</span>
                  <span className="theme-color-control" title={`Change ${label.toLowerCase()} color`}>
                    <input type="color" value={selected?.vars?.[key] || '#ffffff'} onChange={(e) => updateVar(key, e.target.value)} aria-label={label} />
                    <Pipette size={16} aria-hidden="true" />
                  </span>
                </label>)}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="custom-theme-reset">
          <button type="button" onClick={onResetAll} className="settings-text-button settings-danger">Remove all custom themes</button>
        </div>
      </details>
    </div>
  );
};

export default CustomThemePanel;
