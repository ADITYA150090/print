"use client";

import { useState } from "react";
import { BarChart2, Users, FileText, Bell, User } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // adjust path if needed

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState("Dashboard");

  // ✅ Customize menu here (different roles can have different menus)
  const menuItems = [
    { name: "Dashboard", icon: <BarChart2 size={20} />, route: "/dashboard" },
    { name: "Officers", icon: <Users size={20} />, route: "/dashboard/officers" },
    { name: "Billing", icon: <FileText size={20} />, route: "/dashboard/billing" },
    { name: "Notification", icon: <Bell size={20} />, route: "/dashboard/notification" },
    { name: "Profile", icon: <User size={20} />, route: "/${officerId}/profile" },
  ];

  return (
    <div className="flex">
      <Sidebar active={active} setActive={setActive} menuItems={menuItems} />
      <main className="flex-1 ml-20 md:ml-64 transition-all p-6">
        {children}
      </main>
    </div>
  );
}
