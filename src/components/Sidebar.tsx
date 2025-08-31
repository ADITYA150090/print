"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  User,
  FileText,
  BarChart2,
  LogOut,
  Users,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type UserType = {
  name?: string;
  officerName?: string; // fallback
  role?: "officer" | "rmo" | "admin" | string;
  email?: string;
};

interface SidebarProps {
  active: string;
  setActive: (item: string) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) setUser(data.user);
      } catch (err) {
        console.error("❌ Sidebar fetch error:", err);
      }
    }
    fetchUser();
  }, []);

  // Pick correct name (backend sometimes may differ)
  const displayName = user?.name || user?.officerName || "User";

 // Role-based dashboard route
const role = user?.role?.toLowerCase();

const dashboardRoute =
  role === "officer"
    ? "/dashboard/officer"
    : role === "rmo"
    ? "/dashboard/rmo"
    : role === "admin"
    ? "/dashboard/admin"
    : "/dashboard/admin"; // fallback

  const menuItems = [
    { name: "Dashboard", icon: <BarChart2 size={20} />, route: dashboardRoute },
    { name: "Officers", icon: <Users size={20} />, route: "/dashboard/officers" },
    { name: "Billing", icon: <FileText size={20} />, route: "/dashboard/billing" },
    { name: "Profile", icon: <User size={20} />, route: "/dashboard/profile" },
  ];

  return (
    <aside
      className={`h-screen fixed top-0 left-0 flex flex-col
      backdrop-blur-lg bg-gray-900/60 border-r border-gray-700
      text-white shadow-2xl transition-all duration-300 ease-in-out
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Profile Section */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=4f46e5&color=fff`}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-indigo-400"
        />
        {isOpen && (
          <div>
            <h2 className="text-lg font-semibold truncate">{displayName}</h2>
            <p className="text-sm text-indigo-300">{user?.role || ""}</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActive(item.name);
              router.push(item.route);
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition
              ${
                active === item.name
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700/70"
              }`}
          >
            {item.icon}
            {isOpen && <span>{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto p-4">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 w-full px-4 py-2
          bg-red-500 hover:bg-red-600 text-white rounded-md transition"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 -right-3 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-500 transition"
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
}
