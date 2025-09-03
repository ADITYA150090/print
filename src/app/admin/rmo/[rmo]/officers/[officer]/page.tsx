"use client";

import { useRouter } from "next/navigation";
import { Plus, MapPin, FileText, CheckCircle, Truck, Package } from "lucide-react";
import { useState, useEffect } from "react";

export default function OfficerDashboardPage({
  params,
}: {
  params: { officer: string; rmo: string };
}) {
  const router = useRouter();

  // Hardcoded officerId for now
  const  = "off11"; 

  // Fake stats (can later be fetched from API)
  const [stats, setStats] = useState({
    unverified: 250,
    verified: 500,
    onTransit: 300,
    totalDelivered: 50000,
  });

  useEffect(() => {
    console.log("Officer Page Mounted");
    console.log("From dynamic route officer:", params.officer);
    console.log("Hardcoded officerId:", officerId);
  }, [params.officer]);

  const handleCardClick = (type: string) => {
    switch (type) {
      case "unverified":
        router.push(`/rmo/${params.rmo}/officers/${officerId}/lots/unverified`);
        break;
      case "verified":
        router.push(`/rmo/${params.rmo}/officers/${officerId}/lots/verified`);
        break;
      case "onTransit":
        router.push(`/rmo/${params.rmo}/officers/${officerId}/lots/on-transit`);
        break;
      case "totalDelivered":
        router.push(`/rmo/${params.rmo}/officers/${officerId}/lots/delivered`);
        break;
      default:
        break;
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "createNameplate":
        router.push(`/rmo/${params.rmo}/officers/${officer.officerNumber}/lots/createNameplate`);
        break;
      case "trackOrder":
        router.push(`/rmo/${params.rmo}/officers/${officer.officerNumber}/track-order`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Officer Dashboard ({officerId})
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => handleCardClick("unverified")}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-red-500" />
            <p className="text-gray-500 font-semibold">Unverified</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.unverified}</h2>
          <p className="text-gray-400 mt-1 text-sm">Data</p>
        </div>

        <div
          onClick={() => handleCardClick("verified")}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-gray-500 font-semibold">Verified</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.verified}</h2>
          <p className="text-gray-400 mt-1 text-sm">Data</p>
        </div>

        <div
          onClick={() => handleCardClick("onTransit")}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-yellow-500" />
            <p className="text-gray-500 font-semibold">On Transit</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.onTransit}</h2>
        </div>

        <div
          onClick={() => handleCardClick("totalDelivered")}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition"
        >
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
        <button
          onClick={() => handleActionClick("createNameplate")}
          className="bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-indigo-700 transition"
        >
          <div>
            <p className="font-semibold text-lg">Create Name Plate</p>
            <p className="text-gray-200 mt-1 text-sm">Design new nameplates</p>
          </div>
          <Plus className="w-8 h-8" />
        </button>

        <button
          onClick={() => handleActionClick("trackOrder")}
          className="bg-green-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-green-700 transition"
        >
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
