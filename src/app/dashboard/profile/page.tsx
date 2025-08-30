"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      // Call API to clear cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login"); // redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return <p>Loading user info...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Mobile: {user.mobile}</p>
      <p>Designation: {user.designation}</p>
      <p>Area: {user.area}</p>
      <p>Delivery Office: {user.deliveryOffice}</p>

      {/* 🚀 Logout button */}
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
