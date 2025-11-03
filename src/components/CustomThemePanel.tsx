import React, { useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeVarKey } from '../contexts/ThemeContext';

const groups: Array<{ title: string; keys: { key: ThemeVarKey; label: string }[] }> = [
  {
    title: 'Brand',
    keys: [
      { key: 'color-primary', label: 'Primary' },
      { key: 'color-secondary', label: 'Secondary' },
      { key: 'color-accent', label: 'Accent' },
    ],
  },
  {
    title: 'Base',
    keys: [
      { key: 'color-background', label: 'Background' },
      { key: 'color-surface', label: 'Surface' },
    ],
  },
  {
    title: 'Text',
    keys: [
      { key: 'color-text', label: 'Text' },
      { key: 'color-text-secondary', label: 'Text Secondary' },
    ],
  },
  {
    title: 'Borders',
    keys: [
      { key: 'color-border', label: 'Border' },
    ],
  },
  {
    title: 'Status',
    keys: [
      { key: 'color-error', label: 'Error' },
      { key: 'color-warning', label: 'Warning' },
      { key: 'color-success', label: 'Success' },
    ],
  },
];

const swatchStyle: React.CSSProperties = { width: 24, height: 24, borderRadius: 4, border: '1px solid #e0e0e0' };

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
  }, [selected?.id]);

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
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="flex-1">
          <label className="block text-text-secondary text-sm mb-1">Saved Themes</label>
          <select
            value={selected?.id || ''}
            onChange={(e) => selectCustomTheme(e.target.value)}
            className="w-full bg-background border border-border text-text p-2 rounded"
          >
            {savedThemes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addCustomTheme('New Theme', selected?.vars)}
            className="px-3 py-2 rounded bg-primary text-background border border-primary"
          >
            Add
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded bg-red-600 text-white border border-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Rename */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">Theme Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => selected && renameCustomTheme(selected.id, name.trim() || selected.name)}
          className="w-full bg-background border border-border text-text p-2 rounded"
          placeholder="My Theme"
        />
      </div>

      {/* Color pickers */}
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.title} className="border border-border rounded-md">
            <div className="px-3 py-2 bg-background text-text font-semibold border-b border-border">{g.title}</div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.keys.map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between gap-3">
                  <span className="text-text-secondary text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <div style={{ ...swatchStyle, background: selected?.vars?.[key] || '#ffffff' }} />
                    <input
                      type="color"
                      value={selected?.vars?.[key] || '#ffffff'}
                      onChange={(e) => updateVar(key, e.target.value)}
                      className="w-10 h-8 p-0 bg-transparent border-0"
                      aria-label={label}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="pt-2">
        <button onClick={onResetAll} className="w-full px-3 py-2 rounded border border-red-600 text-red-600">
          Remove all custom themes
        </button>
      </div>
    </div>
  );
};

export default CustomThemePanel;
