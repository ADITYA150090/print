"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Lot {
  id: string;
  name: string;
}

interface Officer {
  officerName: string;
  officerNumber: string;
  rmo: string;
}

export default function OfficerLotsPage() {
  const { rmo, officerId } = useParams() as { rmo: string; officerId: string };
  const router = useRouter();

  const [lots, setLots] = useState<Lot[]>([]);
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get officer details from /auth/me
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setOfficer({
            officerName: meData.user.officerName,
            officerNumber: meData.user.officerNumber,
            rmo: meData.user.rmo,
          });
        }

        // 2. Get lots for this officer
        const lotsRes = await fetch(`/api/rmo/${rmo}/officers/${officerId}/lots`);
        const lotsData = await lotsRes.json();
        if (lotsData.success && Array.isArray(lotsData.lots)) {
          setLots(lotsData.lots);
        }
      } catch (error) {
        console.error("❌ Failed to fetch officer or lots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rmo, officerId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          Lots under Officer{" "}
          <span className="text-blue-600">{officer?.officerName || "..."}</span>{" "}
          (<span className="text-green-600">{officer?.officerNumber || "..."}</span>) - RMO:{" "}
          <span className="text-purple-600">{officer?.rmo || rmo}</span>
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading lots...</p>
        ) : lots.length === 0 ? (
          <p className="text-gray-500">No lots found for this officer.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <button
                key={lot.id}
                onClick={() =>
                  router.push(`/rmo/${rmo}/officers/${officerId}/lots/${lot.id}`)
                }
                className="w-full text-left p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition transform hover:-translate-y-1"
              >
                <p className="text-lg font-semibold text-gray-700">{lot.name}</p>
                <p className="text-sm text-gray-500 mt-1">ID: {lot.id}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
