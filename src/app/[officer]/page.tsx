"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, MapPin, FileText, CheckCircle, Truck, Package } from "lucide-react";
import { useState, useEffect } from "react";

interface Stats {
  unverified: number;
  verified: number;
  onTransit: number;
  totalDelivered: number;
}

export default function OfficerDashboardPage() {
  const router = useRouter();
  const params = useParams<{ officer: string }>();
  const officerIdRaw = params.officer;

  // Convert officerId to lowercase for API
  const officerId = officerIdRaw?.toLowerCase() || "";

  const [stats, setStats] = useState<Stats>({
    unverified: 0,
    verified: 0,
    onTransit: 0,
    totalDelivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officerId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/${officerId}`);
        const data = await res.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || "Failed to fetch stats");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Error fetching stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [officerId]);

  const handleCardClick = (type: string) => {
    router.push(`/officers/${officerId}/${type === "onTransit" ? "lots/on-transit" : type === "totalDelivered" ? "lots/delivered" : `lots/${type}`}`);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "showlots":
        router.push(`/${officerId}/lots`);
        break;
      case "trackOrder":
        router.push(`/officers/${officerId}/track-order`);
        break;
      default:
        break;
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading officer stats...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Officer Dashboard ({officerId.toUpperCase()})
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div onClick={() => handleCardClick("unverified")} className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-red-500" />
            <p className="text-gray-500 font-semibold">Unverified</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.unverified}</h2>
          <p className="text-gray-400 mt-1 text-sm">Data</p>
        </div>

        <div onClick={() => handleCardClick("verified")} className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-gray-500 font-semibold">Verified</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.verified}</h2>
          <p className="text-gray-400 mt-1 text-sm">Data</p>
        </div>

        <div onClick={() => handleCardClick("onTransit")} className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-yellow-500" />
            <p className="text-gray-500 font-semibold">On Transit</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.onTransit}</h2>
        </div>

        <div onClick={() => handleCardClick("totalDelivered")} className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-blue-500" />
            <p className="text-gray-500 font-semibold">Total Delivered</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.totalDelivered}</h2>
          <p className="text-gray-400 mt-1 text-sm">Till Date</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button onClick={() => handleActionClick("showlots")} className="bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-indigo-700 transition">
          <div>
            <p className="font-semibold text-lg">Show Lots</p>
            <p className="text-gray-200 mt-1 text-sm">Create New Lots</p>
          </div>
          <Plus className="w-8 h-8" />
        </button>

        <button onClick={() => handleActionClick("trackOrder")} className="bg-green-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-green-700 transition">
          <div>
            <p className="font-semibold text-lg">Track Your Order</p>
            <p className="text-gray-200 mt-1 text-sm">See your delivery status</p>
          </div>
          <MapPin className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
