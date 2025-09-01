"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Truck,
  PackageCheck,
  Receipt,
  CheckCircle2,
  FileText,
} from "lucide-react"; // ✅ Import icons

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
      value: loading ? "..." : officers.length,
      redirect: "/dashboard/orm/officers",
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Unverified Data",
      value: "1200",
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
    },
    {
      title: "Verified Data",
      value: "2500",
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    },
    {
      title: "On Transit",
      value: "1300",
      icon: <Truck className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Total Delivered till Date",
      value: "250000",
      icon: <PackageCheck className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Un Billing Data",
      value: "1300",
      icon: <Receipt className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Paid Data",
      value: "250000",
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    },
    {
      title: "Billing Details",
      value: "—",
      icon: <FileText className="w-8 h-8 text-gray-500" />,
    },
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
            className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-black/10 flex flex-col items-center justify-center hover:scale-105 transition"
          >
            {/* Icon */}
            <div className="mb-3">{stat.icon}</div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              {stat.title}
            </h2>

            {/* Value */}
            <p className="text-3xl font-extrabold text-black">{stat.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
