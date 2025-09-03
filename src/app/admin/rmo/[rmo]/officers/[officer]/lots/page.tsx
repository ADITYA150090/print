"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Nameplate {
  _id: string;
  rmo: string;
  officer: string;
  lot: string;
  [key: string]: any;
}

export default function OfficerLotsPage() {
  const { rmo } = useParams() as { rmo: string };

  const [officerNumber, setOfficerNumber] = useState<string | null>(null);
  const [lots, setLots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch officer info
  useEffect(() => {
    const fetchOfficer = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.success && data.user?.officerNumber) {
          setOfficerNumber(data.user.officerNumber);
        } else {
          console.error("❌ Could not fetch officer number", data);
        }
      } catch (error) {
        console.error("❌ Error fetching officer info:", error);
      }
    };

    fetchOfficer();
  }, []);

  // Fetch unverified nameplates and filter by RMO + officer
  useEffect(() => {
    const fetchLots = async () => {
      if (!rmo || !officerNumber) return;

      try {
        const res = await fetch(`/api/unverify`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          // Filter records by RMO + officer
          const filtered = data.data.filter(
            (item: Nameplate) =>
              item.rmo === rmo && item.officer === officerNumber
          );

          // Collect unique lots
          const uniqueLots = Array.from(new Set(filtered.map((i) => i.lot)));

          setLots(uniqueLots);
        }
      } catch (error) {
        console.error("Failed to fetch lots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [rmo, officerNumber]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          Lots under Officer{" "}
          <span className="text-blue-600">{officerNumber ?? "Loading..."}</span>{" "}
          (<span className="text-green-600">{rmo}</span>)
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading lots...</p>
        ) : lots.length === 0 ? (
          <p className="text-gray-500">No lots found for this officer.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {officerNumber &&
              lots.map((lot) => (
                <Link
                  key={lot}
                  href={`/rmo/${rmo}/officers/${officerNumber}/lots/${lot}`}
                >
                  <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition transform hover:-translate-y-1 cursor-pointer">
                    <p className="text-lg font-semibold text-gray-700">
                      {lot}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Lot ID: {lot}</p>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
