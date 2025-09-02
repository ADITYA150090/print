"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RmoLandingPage() {
  const [rmos, setRmos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRMOs = async () => {
      try {
        const res = await fetch("/api/rmo");
        const data = await res.json();

        if (data.success && Array.isArray(data.rmos)) {
          setRmos(data.rmos);
        }
      } catch (error) {
        console.error("Failed to fetch RMOs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRMOs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All RMOs</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : rmos.length === 0 ? (
          <p className="text-gray-500">No RMOs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {rmos.map((rmo) => (
              <Link
                key={rmo}
                href={`/rmo/${rmo}/officers`}
                className="block p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-200 border border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-800">{rmo}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Officers under {rmo}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
