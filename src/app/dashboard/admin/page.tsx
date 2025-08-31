"use client";

import { useRouter } from "next/navigation";
import { Users, FileText, Truck, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  // Mock data — replace with API calls
  const stats = {
    totalOfficers: 785,
    todayUnverified: 1200,
    todayVerified: 2500,
    dispatch: 1300,
    totalDelivered: 250000,
    unBillingData: 1300,
    paidData: 900,
  };

  // Click handlers
  const handleCardClick = (type: string) => {
    switch (type) {
      case "totalOfficers":
        router.push("/dashboard/officers");
        break;
      case "todayUnverified":
        router.push("/dashboard/orders/unverified");
        break;
      case "todayVerified":
        router.push("/dashboard/orders/verified");
        break;
      case "dispatch":
        router.push("/dashboard/orders/dispatch");
        break;
      case "totalDelivered":
        router.push("/dashboard/orders/delivered");
        break;
      case "unBillingData":
        router.push("/dashboard/billing/unpaid");
        break;
      case "paidData":
        router.push("/dashboard/billing/paid");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => handleCardClick("totalOfficers")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Total Officers
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.totalOfficers}</h2>
        </div>

        <div
          onClick={() => handleCardClick("todayUnverified")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" /> Today Unverified
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.todayUnverified}</h2>
        </div>

        <div
          onClick={() => handleCardClick("todayVerified")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" /> Today Verified
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.todayVerified}</h2>
        </div>

        <div
          onClick={() => handleCardClick("dispatch")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <Truck className="w-5 h-5 text-yellow-500" /> Dispatch
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.dispatch}</h2>
        </div>

        <div
          onClick={() => handleCardClick("totalDelivered")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" /> Total Delivered
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.totalDelivered}</h2>
          <p className="text-gray-400 mt-1">Till Date</p>
        </div>

        <div
          onClick={() => handleCardClick("unBillingData")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-500" /> Un Billing Data
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.unBillingData}</h2>
        </div>

        <div
          onClick={() => handleCardClick("paidData")}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
        >
          <p className="text-gray-500 font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" /> Paid Data
          </p>
          <h2 className="text-3xl font-bold mt-2">{stats.paidData}</h2>
        </div>
      </div>

      {/* Actions Section - only Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-center hover:bg-indigo-700 transition font-semibold text-lg"
        >
          View Billing Details
        </button>
      </div>
    </div>
  );
}
