"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Nameplate {
  id: string;
  houseName: string;
  ownerName: string;
  spouseName: string;
  address: string;
  imageUrl: string;
}

export default function LotDetailPage() {
  const params = useParams();
  const officerParam = params.officer as string;
  const lot = params.lot as string;

  const [records, setRecords] = useState<Nameplate[]>([]);
  const [rmo, setRmo] = useState<string | null>(null);
  const router = useRouter();

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

  // Fetch nameplates once RMO is available
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (!officerParam || !lot || !rmo) return;

        const officer = officerParam.toUpperCase();

        console.log("Fetching nameplates for:", { rmo, officer, lot });

        const res = await fetch(`/api/rmo/${rmo}/officers/${officer}/lots/${lot}`);
        const data = await res.json();

        console.log("API response:", data);

        setRecords(data.records || []);
      } catch (err) {
        console.error("Error fetching records:", err);
      }
    };

    fetchRecords();
  }, [officerParam, lot, rmo]);

  const handleCreateDesign = () => {
    router.push(`/${officerParam}/lots/${lot}/createNameplate`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 relative text-black">
      <h1 className="text-3xl font-bold mb-4">Lot: {lot}</h1>
      <p className="text-lg mb-6">Officer: {officerParam}</p>

      <button
        onClick={handleCreateDesign}
        className="fixed top-6 right-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Create Design
      </button>

      {records.length === 0 ? (
        <p>No records found for this lot.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {records.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded shadow-md">
              <img
                src={record.imageUrl}
                alt={record.houseName}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold mt-2">{record.houseName}</h3>
              <p className="text-sm">Owner: {record.ownerName}</p>
              {record.spouseName && <p className="text-sm">Spouse: {record.spouseName}</p>}
              <p className="text-sm">Address: {record.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
