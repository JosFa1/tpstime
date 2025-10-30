import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import CustomThemePanel from './CustomThemePanel';

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded border font-semibold transition-colors duration-150 ${active ? 'bg-primary text-background border-primary' : 'bg-background text-primary border border-primary'}`}
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

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useTheme();

  return (
    <div className="p-4 bg-surface rounded-lg border border-border max-w-md mx-auto w-full">
      <h3 className="text-lg font-semibold text-text mb-4 text-center">Theme Settings</h3>

      {/* Mode selection */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <ModeButton active={mode === 'dark'} onClick={() => setMode('dark')}>Dark</ModeButton>
        <ModeButton active={mode === 'system'} onClick={() => setMode('system')}>System</ModeButton>
        <ModeButton active={mode === 'light'} onClick={() => setMode('light')}>Light</ModeButton>
        <ModeButton active={mode === 'custom'} onClick={() => setMode('custom')}>Custom</ModeButton>
      </div>

      {/* Live preview uses global CSS vars for simplicity */}
      <PreviewCard />

      {/* Custom editor */}
      {mode === 'custom' && (
        <div className="mt-4">
          <CustomThemePanel />
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;