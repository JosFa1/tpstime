import React from "react";
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";

const Houses: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <div className="w-full flex flex-row justify-end items-center pt-4 pb-2 px-2 sm:px-4">
        <HamburgerMenu />
      </div>

      <main className="flex-grow">
        <div className="pt-2 max-w-4xl w-full mx-auto px-4">
          <h1 className="text-2xl font-semibold text-center mb-6">Houses Live Rankings</h1>

          <div className="space-y-4">
            <div className="border-2 rounded-lg p-4">
              <h2 className="text-lg font-medium text-center">Monday</h2>
              <p className="text-center">option1 | option2 | option3 | option4 | option5</p>
            </div>

            <div className="border-2 rounded-lg p-4">
              <h2 className="text-lg font-medium text-center">Tuesday</h2>
              <p className="text-center">option1 | option2 | option3 | option4 | option5</p>
            </div>

            <div className="border-2 rounded-lg p-4">
              <h2 className="text-lg font-medium text-center">Wednesday</h2>
              <p className="text-center">option1 | option2 | option3 | option4 | option5</p>
            </div>

            <div className="border-2 rounded-lg p-4">
              <h2 className="text-lg font-medium text-center">Thursday</h2>
              <p className="text-center">option1 | option2 | option3 | option4 | option5</p>
            </div>

            <div className="border-2 rounded-lg p-4">
              <h2 className="text-lg font-medium text-center">Friday</h2>
              <p className="text-center">option1 | option2 | option3 | option4 | option5</p>
            </div>
          </div>
        </div>
      </main>

      <FooterNote />
    </div>
  );
};

export default Houses;
