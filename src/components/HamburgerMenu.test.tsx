import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';

jest.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn(), user: null }) }));
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ({ pathname: '/' }), useNavigate: () => () => {},
  Link: ({ to, ...props }: { to: string }) => require('react').createElement('a', { href: to, ...props }),
}), { virtual: true });

it('exposes its state, handles keyboard dismissal, and closes on navigation', () => {
  render(<MemoryRouter><HamburgerMenu /></MemoryRouter>);
  const menu = screen.getByRole('button', { name: 'Menu' });
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  userEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  const upper = screen.getByRole('button', { name: 'Upper school' });
  expect(upper).toHaveAttribute('aria-pressed', 'true');
  upper.focus();
  fireEvent.keyDown(upper, { key: 'Escape' });
  expect(menu).toHaveFocus();
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  userEvent.click(menu);
  userEvent.click(screen.getByRole('link', { name: 'Settings' }));
  expect(menu).toHaveAttribute('aria-expanded', 'false');
});

it('dismisses on outside pointer input and when keyboard focus leaves', () => {
  render(<MemoryRouter><HamburgerMenu /><button>Outside</button></MemoryRouter>);
  const menu = screen.getByRole('button', { name: 'Menu' });
  userEvent.click(menu);
  fireEvent.pointerDown(screen.getByText('Outside'));
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  userEvent.click(menu);
  fireEvent.blur(menu, { relatedTarget: screen.getByText('Outside') });
  expect(menu).toHaveAttribute('aria-expanded', 'false');
});
