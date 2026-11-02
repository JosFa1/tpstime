import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import WhatsNew from './WhatsNew';

beforeAll(() => { HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); }; });
beforeEach(() => localStorage.clear());

test('shows the announcement once after dismissal', () => {
  const view = render(<WhatsNew />);
  const announcement = screen.getByRole('dialog', { name: "What's new in TPSTime" });
  expect(announcement).toHaveTextContent('Version 3');
  expect(announcement).toHaveTextContent('Made by Jason Wang');
  fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.unmount();
  render(<WhatsNew />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
