import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import GrilleMenu from './grilleMenu';

jest.mock('../components/HamburgerMenu', () => () => null);

test('the day selector changes the selected menu', () => {
  const { container } = render(<GrilleMenu />);
  fireEvent.click(screen.getByRole('button', { name: 'Tue' }));
  expect(screen.getByRole('button', { name: 'Tue' })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('.grille-day--selected')).toHaveTextContent('Chicken Soft & Barbacoa Beef Tacos');
});

test('preserves every weekday offering and separates main dishes from sides', () => {
  render(<GrilleMenu />);
  const offerings = {
    Monday: ['Spaghetti & Meatballs', 'Broccoli w/ Garlic & Lemon', 'Garlic Bread Stick', 'Grilled Chicken Breast', 'Regular Fries'],
    Tuesday: ['Chicken Soft & Barbacoa Beef Tacos', 'Taco Salad', 'Spanish Style Corn', 'Cilantro Lime Rice', 'Red Beans & Rice', 'Mexican Quinoa', 'Crinkle Cut Fries'],
    Wednesday: ['Sweet & Sour Chicken', 'Vegetable Fried Rice', 'Vegetable Blend Mandarin Stir Fry', 'Vegetable Egg Rolls', 'Regular Fries'],
    Thursday: ['BBQ Chopped Chicken', 'Baked Mac & Cheese', 'Vegetable Blend California Normandy', 'Vegetarian Baked Beans', 'Regular Fries'],
    Friday: ['Seared Balsamic Salmon Fillet', 'Tuscan Style Roasted Potatoes', 'Quinoa Pilaf', 'Greek Spinach', 'Tuscan Zucchini & Tomatoes', 'Waffle Fries'],
  };
  Object.entries(offerings).forEach(([day, items]) => {
    expect(within(screen.getByRole('region', { name: day })).getAllByRole('listitem').map(item => item.textContent).sort()).toEqual([...items].sort());
  });
  expect(within(screen.getByRole('list', { name: 'Monday main dishes' })).getAllByRole('listitem').map(item => item.textContent)).toEqual(['Spaghetti & Meatballs', 'Grilled Chicken Breast']);
  expect(screen.getByRole('list', { name: 'Tuesday main dishes' })).toHaveTextContent('Taco Salad');
  expect(screen.getByRole('list', { name: 'Friday sides' })).toHaveTextContent('Waffle Fries');
});
