"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [officers, setOfficers] = useState(0);
  const [rmos, setRmos] = useState(0);
  const [nameplates, setNameplates] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1️⃣ Fetch all RMOs
        const rmoRes = await fetch("/api/rmo");
        const rmoData = await rmoRes.json();
        if (rmoData.success && Array.isArray(rmoData.rmos)) {
          setRmos(rmoData.rmos.length);

          // 2️⃣ Fetch officers count across all RMOs
          let officerCount = 0;
          for (const rmo of rmoData.rmos) {
            const officersRes = await fetch(`/api/rmo/${rmo.id}/officers`);
            const officersData = await officersRes.json();
            if (officersData.success && Array.isArray(officersData.officers)) {
              officerCount += officersData.officers.length;
            }
          }
          setOfficers(officerCount);
        }

        // 3️⃣ Fetch nameplates count from DB
        const nameplateRes = await fetch("/api/admin/nameplates");
        const nameplateData = await nameplateRes.json();
        if (nameplateData.success) {
          setNameplates(nameplateData.count);
        }
      } catch (err) {
        console.error("❌ Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10">📊 Dashboard</h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Officers */}
            {/* <div
              onClick={() => router.push("/admin/officers")}
              className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition transform hover:-translate-y-1"
            >
              <h2 className="text-lg font-semibold text-gray-600">Total Officers</h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">{officers}</p>
            </div> */}

            {/* RMOs */}
            <div
              onClick={() => router.push("/admin/rmo")}
              className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition transform hover:-translate-y-1"
            >
              <h2 className="text-lg font-semibold text-gray-600">Total RMOs</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{rmos}</p>
            </div>

            {/* Nameplates */}
            <div
              onClick={() => router.push("/admin/nameplates")}
              className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition transform hover:-translate-y-1"
            >
              <h2 className="text-lg font-semibold text-gray-600">Nameplates to Print</h2>
              <p className="text-3xl font-bold text-purple-600 mt-2">{nameplates}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
