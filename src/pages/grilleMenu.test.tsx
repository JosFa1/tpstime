import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GrilleMenu from './grilleMenu';

jest.mock('../components/HamburgerMenu', () => () => null);

test('the day selector changes the selected menu', () => {
  const { container } = render(<GrilleMenu />);
  fireEvent.click(screen.getByRole('button', { name: 'Tue' }));
  expect(screen.getByRole('button', { name: 'Tue' })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('.grille-day--selected')).toHaveTextContent('Chicken Soft & Barbacoa Beef Tacos');
});
