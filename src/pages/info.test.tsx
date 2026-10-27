import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Info from './info';

jest.mock('../components/HamburgerMenu', () => () => null);

test('opens and closes the version 3 changelog', () => {
  render(<Info />);
  fireEvent.click(screen.getByRole('button', { name: 'v- 3.0 - Jason Wang' }));
  const dialog = screen.getByRole('dialog', { name: 'Version 3.0' });
  expect(dialog).toHaveTextContent('Made by Jason Wang');
  expect(dialog).toHaveTextContent('interactive graph');
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
});
