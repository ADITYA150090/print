"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Lot {
  id: string;
  name: string;
}

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [rmo, setRmo] = useState<string | null>(null);
  const router = useRouter();
  const { officer } = useParams();

  // Fetch RMO from auth/me
  useEffect(() => {
    const fetchRmo = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setRmo(data.user.rmo);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchRmo();
  }, []);

  // Fetch lots once RMO is available
  useEffect(() => {
    const fetchLots = async () => {
      try {
        if (!officer || !rmo) return;

        const apiOfficer = officer.toUpperCase();
        const res = await fetch(`/api/rmo/${rmo}/officers/${apiOfficer}/lots`);
        const data = await res.json();

        console.log("API response:", data);

        // Remove duplicates based on lot id
        const uniqueLotsMap = new Map<string, Lot>();
        (data.lots || []).forEach((lot: Lot) => {
          if (!uniqueLotsMap.has(lot.id)) {
            uniqueLotsMap.set(lot.id, lot);
          }
        });

        setLots(Array.from(uniqueLotsMap.values()));
      } catch (err) {
        console.error("Error fetching lots:", err);
      }
    };

    fetchLots();
  }, [officer, rmo]);

  const handleLotClick = (lotId: string) => {
    router.push(`/${officer}/lots/${lotId}`);
  };

  const handleCreateLot = () => {
    const newLotId = `Lot_${lots.length + 1}`;
    setLots((prev) => [...prev, { id: newLotId, name: `Lot ${lots.length + 1}` }]);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black relative">
      <button
        onClick={handleCreateLot}
        className="fixed top-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Lot
      </button>

      <h1 className="text-2xl font-bold mb-4">Lots for Officer: {officer}</h1>

      {lots.length === 0 ? (
        <p>No lots available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lots.map((lot) => (
            <div
              key={lot.id}
              onClick={() => handleLotClick(lot.id)}
              className="bg-white p-6 rounded shadow-md cursor-pointer hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{lot.id}</h3>
              <p className="text-sm text-gray-600">{lot.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
