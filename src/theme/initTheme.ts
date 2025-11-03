export function initializeThemeFromSystemPreference() {
  const MODE_KEY = 'themeMode';
  const SAVED_KEY = 'savedThemes';
  const SELECTED_ID_KEY = 'selectedCustomThemeId';

  const mode = (localStorage.getItem(MODE_KEY) as 'dark' | 'light' | 'system' | 'custom' | null) || 'dark';
  const root = document.documentElement;

  function clearInlineVars() {
    const keys = [
      'color-primary','color-secondary','color-accent','color-background','color-surface','color-text','color-text-secondary','color-border','color-error','color-warning','color-success'
    ];
    keys.forEach((k) => root.style.removeProperty(`--${k}`));
  }

  function applyVars(vars: Record<string, string>) {
    Object.keys(vars).forEach((k) => root.style.setProperty(`--${k}` as any, (vars as any)[k] as string));
  }

  const applySystem = () => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    if (prefersDark) root.classList.add('dark');
    else root.setAttribute('data-theme', 'light');
    clearInlineVars();
  };

  // Reset base
  root.classList.remove('dark');
  root.removeAttribute('data-theme');
  clearInlineVars();

  if (mode === 'dark') {
    root.classList.add('dark');
  } else if (mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (mode === 'system') {
    applySystem();
  } else if (mode === 'custom') {
    root.setAttribute('data-theme', 'custom');
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      const selectedId = localStorage.getItem(SELECTED_ID_KEY);
      const selected = Array.isArray(saved) ? saved.find((t: any) => t.id === selectedId) || saved[0] : null;
      if (selected?.vars) applyVars(selected.vars as Record<string, string>);
    } catch {
      // ignore
    }
  }
}
