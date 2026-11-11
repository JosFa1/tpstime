import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Schedule from './schedule';
import { getScheduleStatus } from '../hooks/scheduleStatus';

jest.mock('../hooks/scheduleStatus', () => ({ getScheduleStatus: jest.fn() }));

test('shrinks long summary values and restores their size when the text or available width changes', () => {
  let textWidth = 400;
  const width = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
  const bounds = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width: textWidth } as DOMRect));
  const computed = window.getComputedStyle;
  const styles = jest.spyOn(window, 'getComputedStyle').mockImplementation(element => {
    const style = computed(element);
    Object.defineProperty(style, 'fontSize', { value: '24px' });
    return style;
  });
  const status = (name: string) => (getScheduleStatus as jest.Mock).mockReturnValue({ currentPeriod: { name, start: '08:00', end: '09:00' }, isDayOver: false });
  try {
    status('Advanced Placement Environmental Science');
    const view = render(<Schedule schedule={[]} compact />);
    const value = screen.getByText('Advanced Placement Environmental Science').closest('strong')!;
    expect(parseFloat(value.style.fontSize)).toBeCloseTo(11.94);
    textWidth = 100;
    status('Math');
    view.rerender(<Schedule schedule={[]} compact />);
    expect(screen.getByText('Math').closest('strong')!.style.fontSize).toBe('');
    textWidth = 400;
    fireEvent(window, new Event('resize'));
    expect(parseFloat(screen.getByText('Math').closest('strong')!.style.fontSize)).toBeCloseTo(11.94);
    view.unmount();
  } finally {
    width.mockRestore(); bounds.mockRestore(); styles.mockRestore();
  }
});
