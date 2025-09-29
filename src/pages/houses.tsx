import React, { useMemo, useState } from "react";
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";

// Import house logos
import house1Logo from "../assets/HouseLogos/Eagle.png";
import house2Logo from "../assets/HouseLogos/Lion.png";
import house3Logo from "../assets/HouseLogos/Manatee.png";
import house4Logo from "../assets/HouseLogos/Otter.png";
import house5Logo from "../assets/HouseLogos/Peacock.png";
import house6Logo from "../assets/HouseLogos/Snake.png";

type House = {
  id: string;
  name: string;
  score: number;
};

const initialHouses: House[] = [
  { id: "house1", name: "Hay", score: 0 },
  { id: "house2", name: "Maughan", score: 0 },
  { id: "house3", name: "Lawson", score: 0.1 },
  { id: "house4", name: "St. John", score: 0 },
  { id: "house5", name: "Ellis", score: 0 },
  { id: "house6", name: "Brokaw", score: 0 },
];


const Houses: React.FC = () => {
  const [houses, setHouses] = useState<House[]>(initialHouses);

  // Logo mapping
  const houseLogos: Record<string, string> = {
    house1: house1Logo,
    house2: house2Logo,
    house3: house3Logo,
    house4: house4Logo,
    house5: house5Logo,
    house6: house6Logo,
  };

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

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {ranked.map((house, idx) => (
              <div key={house.id} className="border-2 rounded-lg px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={houseLogos[house.id]} 
                    alt={`${house.name} logo`}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                  />
                  <h2 className="text-xl sm:text-2xl font-medium">#{idx + 1} — {house.name}</h2>
                </div>
                <div className="text-2xl sm:text-3xl font-bold" title={`Raw: ${house.score}`}>
                  {Math.round(house.score)}
                </div>
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
