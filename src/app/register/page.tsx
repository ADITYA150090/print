"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    officerName: "",
    email: "",
    password: "",
    mobileNumber: "",
    rmo: "RMO1", // default value
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`❌ Error: ${data.message}`);
      } else {
        alert("✅ Registered successfully!");
        console.log(data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Officer Registration</h2>

      <input
        type="text"
        name="officerName"
        placeholder="Officer Name"
        value={form.officerName}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="mobileNumber"
        placeholder="Mobile Number"
        value={form.mobileNumber}
        onChange={handleChange}
        className="border p-2 w-full"
      />

<input
  type="text"
  name="rmo"
  placeholder="Enter RMO code (e.g. RMO1)"
  value={form.rmo}
  onChange={handleChange}
  className="border p-2 w-full"
/>



      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Register
      </button>
    </div>
  );
}
