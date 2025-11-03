import React from 'react';
import FooterNote from "../components/FooterNote";
import ThemeSwitcher from "../components/ThemeSwitcher";

const ThemeSwitcherPage: React.FC = () => (
  <>
    <div className="p-4">
      <ThemeSwitcher />
    </div>
    <FooterNote />
  </>
);

export default ThemeSwitcherPage;