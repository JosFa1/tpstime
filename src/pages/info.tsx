import React from 'react';
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";

const Info: React.FC = () => {
  const [showPopup, setShowPopup] = React.useState<null | '1.0' | '2.0'>(null);
  return (
    <div className="min-h-screen flex bg-background text-text">
      <div className="pt-2 max-w-2xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-4">Project Information</h1>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Team</h2>
          <ul className="list-disc ml-6">
            <li><strong>Created By:</strong> James Hawley</li>
            <li><strong>Development Team:</strong> Joe Borgman and Asad Sadikov</li>
            <li><strong>Assistant Developer:</strong> Ryo Kimura</li>
            <li><strong>Project Sponsors:</strong> Alex Podchaski and Tim Eischens</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">New Features (v- 2.0)</h2>
          <ul className="list-disc ml-6">
            <li>Improved navigation with hamburger menu</li>
            <li>Added Google Authentication</li>
            <li>Settings, Info, Grille Menu, and House Pages</li>
            <li>Added TimeSync with server </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Changelog</h2>
          <ul className="list-disc ml-6">
            <li>
              <button
                className="underline text-primary hover:text-secondary focus:outline-none"
                onClick={() => setShowPopup('1.0')}
              >
                v- 1.0 - Hawley J.
              </button>
            </li>
            <li>
              <button
                className="underline text-primary hover:text-secondary focus:outline-none"
                onClick={() => setShowPopup('2.0')}
              >
                v- 2.0 - Borgman J. and Sadikov A.
              </button>
            </li>
          </ul>
          {showPopup === '1.0' && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-surface rounded-lg shadow-lg p-6 max-w-md w-full text-text relative">
                <button className="absolute top-2 right-2 text-xl font-bold" onClick={() => setShowPopup(null)}>&times;</button>
                <h3 className="text-xl font-bold mb-2">1.0 : 09/2023 - 05/2025</h3>
                <ul className="list-disc ml-6">
                  <li>Entire code skeleton created</li>
                  <li>Website under tpstime.com domain</li>
                  <li>Server ran with third-party program</li>
                  <li>Clock ticking based on user computer time</li>
                </ul>
              </div>
            </div>
          )}
          {showPopup === '2.0' && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-surface rounded-lg shadow-lg p-6 max-w-md w-full text-text relative">
                <button className="absolute top-2 right-2 text-xl font-bold" onClick={() => setShowPopup(null)}>&times;</button>
                <h3 className="text-xl font-bold mb-2">2.0 : 08/2025 - Present </h3>
                <ul className="list-disc ml-6">
                  <li>Website ran with TPS server</li>
                  <li>Hamburger icon (w/ Settings, House, Info, and Grille pages)</li>
                  <li>Every users clock's synced with real time</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};



// ...existing code...


const InfoWithFooter: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Top bar: HamburgerMenu top right */}
    <div className="w-full flex flex-row justify-between items-center pt-4 pb-2 px-2 sm:px-4">
      <div />
      <div className="flex flex-row items-center gap-2">
        <HamburgerMenu />
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <Info />
    </div>
    <FooterNote />
  </div>
);


export default InfoWithFooter;
