"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Lot {
  id: string;
  name: string;
}

export default function OfficerLotsPage() {
  const { rmo, officerId } = useParams() as { rmo: string; officerId: string };

  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const res = await fetch(`/api/rmo/${rmo}/officers/${officerId}/lots`);
        const data = await res.json();

        if (data.success && Array.isArray(data.lots)) {
          setLots(data.lots);
        }
      } catch (error) {
        console.error("Failed to fetch lots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [rmo, officerId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          Lots under Officer{" "}
          <span className="text-blue-600">{officerId}</span> (
          <span className="text-green-600">{rmo}</span>)
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading lots...</p>
        ) : lots.length === 0 ? (
          <p className="text-gray-500">No lots found for this officer.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <Link
                key={lot.id}
                href={`/rmo/${rmo}/officers/${officerId}/lots/${lot.id}`}
              >
                <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition transform hover:-translate-y-1 cursor-pointer">
                  <p className="text-lg font-semibold text-gray-700">
                    {lot.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">ID: {lot.id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
