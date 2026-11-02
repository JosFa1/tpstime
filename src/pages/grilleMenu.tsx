import React, { useState } from 'react';
import HamburgerMenu from '../components/HamburgerMenu';
import FooterNote from '../components/FooterNote';
import './grilleMenu.css';

const menu = [
  { day: 'Monday', mains: ['Spaghetti & Meatballs', 'Grilled Chicken Breast'], sides: ['Broccoli w/ Garlic & Lemon', 'Garlic Bread Stick', 'Regular Fries'] },
  { day: 'Tuesday', mains: ['Chicken Soft & Barbacoa Beef Tacos', 'Taco Salad'], sides: ['Spanish Style Corn', 'Cilantro Lime Rice', 'Red Beans & Rice', 'Mexican Quinoa', 'Crinkle Cut Fries'] },
  { day: 'Wednesday', mains: ['Sweet & Sour Chicken'], sides: ['Vegetable Fried Rice', 'Vegetable Blend Mandarin Stir Fry', 'Vegetable Egg Rolls', 'Regular Fries'] },
  { day: 'Thursday', mains: ['BBQ Chopped Chicken'], sides: ['Baked Mac & Cheese', 'Vegetable Blend California Normandy', 'Vegetarian Baked Beans', 'Regular Fries'] },
  { day: 'Friday', mains: ['Seared Balsamic Salmon Fillet'], sides: ['Tuscan Style Roasted Potatoes', 'Quinoa Pilaf', 'Greek Spinach', 'Tuscan Zucchini & Tomatoes', 'Waffle Fries'] },
];

const GrilleMenu: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  return (
  <div className="grille-shell flex flex-col bg-background text-text">
    <div className="w-full flex flex-row justify-end items-center pt-4 pb-2 px-2 sm:px-4"><HamburgerMenu /></div>
    <main className="grille-page">
      <header className="grille-header"><h1>Grille menu</h1></header>
      <nav className="grille-day-picker" aria-label="Choose a menu day">
        {menu.map(({ day }) => <button key={day} type="button" aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>{day.slice(0, 3)}</button>)}
      </nav>
      <div className="grille-days">
        {menu.map(({ day, mains, sides }) => <section className={`grille-day${selectedDay === day ? ' grille-day--selected' : ''}`} key={day} aria-labelledby={`grille-${day}`}>
          <h2 id={`grille-${day}`}>{day}</h2>
          <div className="grille-day__food">
            <ul className="grille-mains" aria-label={`${day} main dishes`}>{mains.map(item => <li key={item}>{item}</li>)}</ul>
            <ul className="grille-sides" aria-label={`${day} sides`}>{sides.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>)}
      </div>
    </main>
    <FooterNote />
  </div>
  );
};

export default GrilleMenu;
