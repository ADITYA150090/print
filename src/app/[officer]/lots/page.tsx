"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Lot {
  id: string;
  name: string;
}

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotCounter, setLotCounter] = useState(1);

  const router = useRouter();
  const { officer } = useParams(); // e.g., officer = "OF11"

  const createLot = () => {
    const newLot: Lot = {
      id: `lot${lotCounter}`,
      name: `Lot ${lotCounter}`,
    };
    setLots((prev) => [...prev, newLot]);
    setLotCounter((prev) => prev + 1);
  };

  const handleLotClick = (lotId: string) => {
    router.push(`/${officer}/lots/${lotId}`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black">
      <button
        onClick={createLot}
        className="fixed top-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Lot
      </button>

      <h1 className="text-2xl font-bold mb-4">Lots for Officer: {officer}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map((lot) => (
          <div
            key={lot.id}
            onClick={() => handleLotClick(lot.id)}
            className="bg-white p-6 rounded shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{lot.name}</h3>
          </div>
        ))}
      </div>
      
    </div>
  );
}
