import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { usePreferences } from './preferences';

function Harness() {
  const [prefs, setPrefs] = usePreferences();
  return <><label>Show mini timer<input type="checkbox" checked={prefs.showMiniTimer} onChange={e => setPrefs(p => ({ ...p, showMiniTimer: e.target.checked }))} /></label><label>Reduce motion<input type="checkbox" checked={prefs.reduceMotion} onChange={e => setPrefs(p => ({ ...p, reduceMotion: e.target.checked }))} /></label><input aria-label="Period 1 name" value={prefs.personalNames['1']} onChange={e => setPrefs(p => ({ ...p, personalNames: { ...p.personalNames, '1': e.target.value } }))} /><label>Dyslexia-friendly font<input type="checkbox" checked={prefs.dyslexicFont} onChange={e => setPrefs(p => ({ ...p, dyslexicFont: e.target.checked }))} /></label><button onClick={() => setPrefs(p => ({ ...p, personalNames: { ...p.personalNames, '1': 'Biology' } }))}>Save</button></>;
}

it('defaults to device motion settings and persists an explicit reduced-motion choice', () => {
  localStorage.setItem('tpstimePreferences', '{}');
  const { unmount } = render(<Harness />);
  expect(screen.getByLabelText('Reduce motion')).not.toBeChecked();
  fireEvent.click(screen.getByLabelText('Reduce motion'));
  expect(JSON.parse(localStorage.getItem('tpstimePreferences')!).reduceMotion).toBe(true);
  unmount();
  render(<Harness />);
  expect(screen.getByLabelText('Reduce motion')).toBeChecked();
});

it('persists and restores the dyslexia-friendly font preference', () => {
  localStorage.removeItem('tpstimePreferences');
  const { unmount } = render(<Harness />);
  fireEvent.click(screen.getByLabelText('Dyslexia-friendly font'));
  expect(JSON.parse(localStorage.getItem('tpstimePreferences')!).dyslexicFont).toBe(true);
  unmount();
  render(<Harness />);
  expect(screen.getByLabelText('Dyslexia-friendly font')).toBeChecked();
});

it('persists changes without a same-window update loop and ignores malformed period names', () => {
  localStorage.setItem('tpstimePreferences', JSON.stringify({ personalNames: { '1': '  Biology  ', '2': 42, '8': 'Extra' } }));
  render(<Harness />);
  expect(screen.getByLabelText('Period 1 name')).toHaveValue('  Biology  ');
  fireEvent.change(screen.getByLabelText('Period 1 name'), { target: { value: 'World History' } });
  expect(screen.getByLabelText('Period 1 name')).toHaveValue('World History');
  expect(JSON.parse(localStorage.getItem('tpstimePreferences')!).personalNames['1']).toBe('World History');
  fireEvent.click(screen.getByText('Save'));
  expect(JSON.parse(localStorage.getItem('tpstimePreferences')!).personalNames).toMatchObject({ '1': 'Biology', '2': '' });
});


it('enables the mini timer by default and remembers when it is hidden', () => {
  localStorage.removeItem('tpstimePreferences');
  const view = render(<Harness />);
  expect(screen.getByLabelText('Show mini timer')).toBeChecked();
  fireEvent.click(screen.getByLabelText('Show mini timer'));
  view.unmount();
  render(<Harness />);
  expect(screen.getByLabelText('Show mini timer')).not.toBeChecked();
});
