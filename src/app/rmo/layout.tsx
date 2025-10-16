"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState } from "react";
import { BarChart2, Users, FileText, Bell, User, InfoIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { log } from "console";
import { parseEnv } from "util";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params=useParams();
 

  

  const [active, setActive] = useState("Dashboard");
  
  // ✅ Sidebar menu items
  const menuItems = [
    {
      name: "Dashboard",
      icon: <BarChart2 size={20} />,
      route: `/rmo/${params.rmo}/officers`,
    }
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
