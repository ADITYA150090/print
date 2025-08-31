"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar active={active} setActive={setActive} />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all p-6 ${
          active ? "ml-20 lg:ml-64" : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
