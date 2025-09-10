"use client";

import { useState } from "react";
import { BarChart2, Users, FileText, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useParams, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState("Dashboard");


  const {officer} = useParams();
 
  const router = useRouter();

  // ✅ Build routes dynamically
  const menuItems = [
    { name: "Dashboard", icon: <BarChart2 size={20} />, route: `/${officer}` },
    { name: "Lots", icon: <Users size={20} />, route: `/${officer}/lots` },
    { name: "Profile", icon: <User size={20} />, route: `/${officer}/profile` },
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
