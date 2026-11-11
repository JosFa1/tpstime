import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import WhatsNew from './WhatsNew';

beforeAll(() => { HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); }; });
beforeEach(() => localStorage.clear());

test('never reopens after being shown, even when the page closes before dismissal', () => {
  const view = render(<WhatsNew />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(localStorage.getItem('tpstime-thanksgiving-update-2026')).toBe('seen');
  view.unmount();
  render(<WhatsNew />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('shows the new update and feedback form once, even after the previous prompt was dismissed', () => {
  localStorage.setItem('tpstime-feedback-prompt-2026', 'seen');
  const view = render(<WhatsNew />);
  expect(screen.getByRole('dialog', { name: /new in TPSTime/ })).toHaveTextContent('adjustable digit spacing');
  expect(screen.getByRole('dialog')).toHaveTextContent('Thanksgiving theme');
  expect(screen.getByTitle('TPSTime feedback form')).toHaveAttribute('src', expect.stringContaining('1FAIpQLScnX3LXrbtjXRo_NWm9qK19_uno2X9UPpZhqU00G8hqN801dw'));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.unmount();
  render(<WhatsNew />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
