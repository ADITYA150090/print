"use client";

import { useRouter } from "next/navigation";
import { Plus, MapPin } from "lucide-react";
import { useState } from "react";

export default function SalesOfficerDashboard() {
  const router = useRouter();

  // Mock data — replace with API calls if needed
  const [stats] = useState({
    unverified: 250,
    verified: 500,
    onTransit: 300,
    totalDelivered: 50000,
  });

  // Click handlers
  const handleCardClick = (type: string) => {
    switch (type) {
      case "unverified":
        router.push("/dashboard/orders/unverified");
        break;
      case "verified":
        router.push("/dashboard/orders/verified");
        break;
      case "onTransit":
        router.push("/dashboard/orders/on-transit");
        break;
      case "totalDelivered":
        router.push("/dashboard/orders/delivered");
        break;
      default:
        break;
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "createNameplate":
        router.push("/dashboard/officer/createNameplate");
        break;
      case "trackOrder":
        router.push("/dashboard/track-order");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Officer Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => handleCardClick("unverified")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold">Unverified</p>
          <h2 className="text-3xl font-bold mt-2">{stats.unverified}</h2>
          <p className="text-gray-400 mt-1">Data</p>
        </div>

        <div
          onClick={() => handleCardClick("verified")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold">Verified</p>
          <h2 className="text-3xl font-bold mt-2">{stats.verified}</h2>
          <p className="text-gray-400 mt-1">Data</p>
        </div>

        <div
          onClick={() => handleCardClick("onTransit")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold">On Transit</p>
          <h2 className="text-3xl font-bold mt-2">{stats.onTransit}</h2>
        </div>

        <div
          onClick={() => handleCardClick("totalDelivered")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold">Total Delivered</p>
          <h2 className="text-3xl font-bold mt-2">{stats.totalDelivered}</h2>
          <p className="text-gray-400 mt-1">Till Date</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => handleActionClick("createNameplate")}
          className="bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-indigo-700 transition"
        >
          <div>
            <p className="font-semibold text-lg">Create Name Plate</p>
            <p className="text-gray-200 mt-1">Design new nameplates</p>
          </div>
          <Plus className="w-8 h-8" />
        </button>

        <button
          onClick={() => handleActionClick("trackOrder")}
          className="bg-green-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-green-700 transition"
        >
          <div>
            <p className="font-semibold text-lg">Track Your Order</p>
            <p className="text-gray-200 mt-1">See your delivery status</p>
          </div>
          <MapPin className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
