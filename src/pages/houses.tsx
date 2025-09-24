import React, { useMemo, useState } from "react";
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";

type House = {
  id: string;
  name: string;
  score: number;
};

const initialHouses: House[] = [
  { id: "house1", name: "House 1", score: 120 },
  { id: "house2", name: "House 2", score: 95 },
  { id: "house3", name: "House 3", score: 150 },
  { id: "house4", name: "House 4", score: 80 },
  { id: "house5", name: "House 5", score: 110 },
  { id: "house6", name: "House 6", score: 60 },
];

const Houses: React.FC = () => {
  const [houses, setHouses] = useState<House[]>(initialHouses);

  // Sorted copy by descending score (highest first)
  const ranked = useMemo(() => {
    return [...houses].sort((a, b) => b.score - a.score);
  }, [houses]);

  const changeScore = (id: string, delta: number) => {
    setHouses((prev) => prev.map(h => h.id === id ? { ...h, score: Math.max(0, h.score + delta) } : h));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <div className="w-full flex flex-row justify-end items-center pt-4 pb-2 px-2 sm:px-4">
        <HamburgerMenu />
      </div>

      <main className="flex-grow">
        <div className="pt-2 max-w-4xl w-full mx-auto px-4">
          <h1 className="text-2xl font-semibold text-center mb-6">House Rankings</h1>

          <div className="grid grid-cols-1 gap-2">
            {ranked.map((house, idx) => (
              <div key={house.id} className="border-2 rounded-lg px-3 py-2 flex items-center justify-between">
                <h2 className="text-md font-medium">#{idx + 1} — {house.name}</h2>
                <div className="text-lg font-bold">{house.score}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <FooterNote />
    </div>
  );
};

export default Houses;
