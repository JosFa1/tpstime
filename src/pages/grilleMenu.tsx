import React, { useState } from 'react';
import HamburgerMenu from '../components/HamburgerMenu';
import FooterNote from '../components/FooterNote';
import './grilleMenu.css';

const menu = [
  { day: 'Monday', items: ['Spaghetti & Meatballs', 'Broccoli w/ Garlic & Lemon', 'Garlic Bread Stick', 'Grilled Chicken Breast', 'Regular Fries'] },
  { day: 'Tuesday', items: ['Chicken Soft & Barbacoa Beef Tacos', 'Taco Salad', 'Spanish Style Corn', 'Cilantro Lime Rice', 'Red Beans & Rice', 'Mexican Quinoa', 'Crinkle Cut Fries'] },
  { day: 'Wednesday', items: ['Sweet & Sour Chicken', 'Vegetable Fried Rice', 'Vegetable Blend Mandarin Stir Fry', 'Vegetable Egg Rolls', 'Regular Fries'] },
  { day: 'Thursday', items: ['BBQ Chopped Chicken', 'Baked Mac & Cheese', 'Vegetable Blend California Normandy', 'Vegetarian Baked Beans', 'Regular Fries'] },
  { day: 'Friday', items: ['Seared Balsamic Salmon Fillet', 'Tuscan Style Roasted Potatoes', 'Quinoa Pilaf', 'Greek Spinach', 'Tuscan Zucchini & Tomatoes', 'Waffle Fries'] },
];

const GrilleMenu: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  return (
  <div className="grille-shell flex flex-col bg-background text-text">
    <div className="w-full flex flex-row justify-end items-center pt-4 pb-2 px-2 sm:px-4"><HamburgerMenu /></div>
    <main className="grille-page">
      <header className="grille-header"><h1>Grille menu</h1><p>This menu is not automatically updated. Check with the Grille for current offerings.</p></header>
      <nav className="grille-day-picker" aria-label="Choose a menu day">
        {menu.map(({ day }) => <button key={day} type="button" aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>{day.slice(0, 3)}</button>)}
      </nav>
      <div className="grille-days">
        {menu.map(({ day, items }, index) => <section className={`grille-day${selectedDay === day ? ' grille-day--selected' : ''}`} key={day} aria-labelledby={`grille-${day}`}>
          <header className="grille-day__heading"><h2 id={`grille-${day}`}>{day}</h2><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></header>
          <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
        </section>)}
      </div>
    </main>
    <FooterNote />
  </div>
  );
};

export default GrilleMenu;
