import React from 'react';
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";

const GrilleMenu: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <div className="w-full flex flex-row justify-end items-center pt-4 pb-2 px-2 sm:px-4">
        <HamburgerMenu />
      </div>
      <div className="flex-grow">
        <div className="pt-2 max-w-4xl w-full mx-auto px-4">
          <div className="space-y-4">
            {/* Monday Box */}
            <div className="border-2 border-accent rounded-lg p-4">
              <h2 className="text-xl font-semibold text-center mb-2">Monday</h2>
              <p className="text-center">Spaghetti & Meatballs | Broccoli w/ Garlic & Lemon | Garlic Bread Stick | Grilled Chicken Breast | Regular Fries</p>
            </div>

            {/* Tuesday Box */}
            <div className="border-2 border-accent rounded-lg p-4">
              <h2 className="text-xl font-semibold text-center mb-2">Tuesday</h2>
              <p className="text-center">Chicken Soft & Barbacoa Beef Tacos | Taco Salad | Spanish Style Corn | Cilantro Lime Rice | Red Beans & Rice | Mexican Quinoa | Crinkle Cut Fries</p>
            </div>

            {/* Wednesday Box */}
            <div className="border-2 border-accent rounded-lg p-4">
              <h2 className="text-xl font-semibold text-center mb-2">Wednesday</h2>
              <p className="text-center">Sweet & Sour Chicken | Vegetable Fried Rice | Vegetable Blend Mandarin Stir Fry | Vegetable Egg Rolls | Regular Fries</p>
            </div>

            {/* Thursday Box */}
            <div className="border-2 border-accent rounded-lg p-4">
              <h2 className="text-xl font-semibold text-center mb-2">Thursday</h2>
              <p className="text-center">BBQ Chopped Chicken | Baked Mac & Cheese | Vegetable Blend California Normandy | Vegetarian Baked Beans | Regular Fries</p>
            </div>

            {/* Friday Box */}
            <div className="border-2 border-accent rounded-lg p-4">
              <h2 className="text-xl font-semibold text-center mb-2">Friday</h2>
              <p className="text-center">Seared Balsamic Salmon Fillet | Tuscan Style Roasted Potatoes | Quinoa Pilaf | Greek Spinach | Tuscan Zucchini & Tomatoes | Waffle Fries</p>
            </div>

          </div>
        </div>
      </div>
      <FooterNote />
    </div>
  );
};

export default GrilleMenu;