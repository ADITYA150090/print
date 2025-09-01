"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await fetch("/api/rmo");
        const data = await res.json();
        if (data.success && Array.isArray(data.officers)) {
          setOfficers(data.officers);
        }
        
      } catch (error) {
        console.error("Failed to fetch officers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const stats = [
    {
      title: "Total Officers",
      value: loading ? "..." : officers.length, // ✅ officer count
      redirect: "/dashboard/orm/officers", // ✅ match with your sidebar route
    },
    { title: "Unverified Data", value: "1200" },
    { title: "Verified Data", value: "2500" },
    { title: "On Transit", value: "1300" },
    { title: "Total Delivered till Date", value: "250000" },
    { title: "Un Billing Data", value: "1300" },
    { title: "Paid Data", value: "250000" },
    { title: "Billing Details", value: "—" },
  ];

  return (
    <div className="min-h-screen text-black bg-gray-100 p-6">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={() => stat.redirect && router.push(stat.redirect)}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-black/20 flex flex-col items-center justify-center hover:scale-105 transition"
          >
            <h2 className="text-lg font-semibold text-black-700 mb-2">
              {stat.title}
            </h2>
            <p className="text-3xl font-extrabold text-black">{stat.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
