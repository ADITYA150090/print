"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserType = {
  role?: "officer" | "rmo" | "admin" | string;
  name?: string;
  officerName?: string;
};

const DashboardButtonPage = () => {
  const router = useRouter();
  const [dashboardRoute, setDashboardRoute] = useState("/dashboard");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
        const data = await res.json();

        if (res.ok && data.success) {
          const role = data.user.role?.toLowerCase();
          const route =
            role === "officer"
              ? "/dashboard/officer"
              : role === "rmo"
              ? "/dashboard/rmo"
              : role === "admin"
              ? "/dashboard/admin"
              : "/dashboard";

          setDashboardRoute(route);
        }
      } catch (err) {
        console.error("❌ Fetch user error:", err);
        setDashboardRoute("/dashboard");
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={() => router.push(dashboardRoute)}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default DashboardButtonPage;
