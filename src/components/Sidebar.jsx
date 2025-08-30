"use client";

import { useEffect, useState } from "react";
import { Menu, LogOut, X } from "lucide-react";

export default function Sidebar({ active, setActive }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // 🔹 important so cookie (JWT) is sent
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          console.error("Failed to fetch user:", data.error);
        }
      } catch (error) {
        console.error("❌ Fetch user error:", error);
      }
    }
    fetchUser();
  }, []);

  const menuItems = ["Dashboard", "Officers", "Billing", "Reports"];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-indigo-600/80 rounded-lg text-white"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-64
        bg-white/10 backdrop-blur-xl border-r border-white/20
        p-6 flex flex-col transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Close button (Mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white"
        >
          <X size={24} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-400">
            <img
              src={`https://ui-avatars.com/api/?name=${
                user?.officerName || "User"
              }&background=4f46e5&color=fff`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-white">
              {user ? user.officerName : "Loading..."}
            </h2>
            <p className="text-sm text-indigo-200">
              {user ? user.role : "Fetching..."}
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActive(item);
                setIsOpen(false);
              }}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition
                ${
                  active === item
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-200 hover:bg-white/20"
                }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="mt-auto">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }); // 🔹 clear cookie
              window.location.href = "/login"; // redirect
            }}
            className="w-full py-2 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500 transition"
          >
            <LogOut className="inline mr-2" size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
