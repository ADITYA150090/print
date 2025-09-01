"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Building,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl p-8 rounded-2xl border border-white/20 
        bg-white/10 backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={`https://ui-avatars.com/api/?name=${user.officerName}&background=6366f1&color=fff`}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-indigo-400 shadow-md"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{user.officerName}</h1>
            <p className="text-indigo-200 font-medium">{user.role}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/90">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-lg">
            <Mail size={18} className="text-indigo-300" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-lg">
            <Phone size={18} className="text-green-300" />
            <span>{user.mobile}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-lg">
            <Briefcase size={18} className="text-yellow-300" />
            <span>{user.designation}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-lg">
            <MapPin size={18} className="text-red-300" />
            <span>{user.area}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-lg sm:col-span-2">
            <Building size={18} className="text-purple-300" />
            <span>{user.deliveryOffice}</span>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 
            bg-red-500/80 hover:bg-red-600 text-white font-medium 
            rounded-lg transition shadow-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
