import React, { useMemo } from "react";
import HamburgerMenu from "../components/HamburgerMenu";
import FooterNote from "../components/FooterNote";
import { useSchedule } from "../hooks/useSchedule";

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

// House points are published from the admin panel as house quick links (points = sortOrder),
// matched the same way as the TPSTime extension.
const HOUSES = [
  { id: "house1", key: "hay", name: "Hay" },
  { id: "house2", key: "maughan", name: "Maughan" },
  { id: "house3", key: "lawson", name: "Lawson" },
  { id: "house4", key: "st-john", name: "St. John" },
  { id: "house5", key: "ellis", name: "Ellis" },
  { id: "house6", key: "brokaw", name: "Brokaw" },
];

const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const Houses: React.FC = () => {
  const { week, error } = useSchedule();

  const houses: House[] = useMemo(
    () =>
      HOUSES.map((house) => {
        const link = week?.quickLinks.find(
          (item) => item.icon === `house:${house.key}` || normalized(item.label) === normalized(house.name)
        );
        return { id: house.id, name: house.name, score: Math.max(0, Math.round(link?.sortOrder ?? 0)) };
      }),
    [week]
  );

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <div className="w-full flex flex-row justify-end items-center pt-4 pb-2 px-2 sm:px-4 bg-background">
        <HamburgerMenu />
      </div>

      <main className="flex-grow bg-background">
        <div className="pt-2 max-w-4xl w-full mx-auto px-4">
          <h1 className="text-2xl font-semibold text-center mb-6 text-text">House Rankings</h1>

          {!week && (
            <p className="text-center text-text-secondary">{error ?? "Loading house points..."}</p>
          )}
          {week && <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {ranked.map((house, idx) => (
              <div key={house.id} className="bg-surface border-2 border-accent rounded-lg px-3 py-2 flex items-center justify-between hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <img 
                    src={houseLogos[house.id]} 
                    alt={`${house.name} logo`}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                  />
                  <h2 className="text-xl sm:text-2xl font-medium text-text">#{idx + 1} — {house.name}</h2>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-text" title={`Raw: ${house.score}`}>
                  {Math.round(house.score)}
                </div>
              </div>
            ))}
          </div>}
        </div>
      </main>

      <FooterNote />
    </div>
  );
};

export default Houses;
