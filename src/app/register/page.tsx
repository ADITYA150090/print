"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }

      const data = await res.json();
      console.log("✅ Registered:", data);

      router.push("/login"); // redirect to login after registration
    } catch (error: any) {
      console.error("❌ Registration error:", error.message);
      alert(error.message || "Something went wrong during registration.");
    }
  };

  return (
    <div className="min-h-screen flex items-center text-black justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
        {/* Step indicator */}
        <div className="flex justify-between mb-6">
          <div
            className={`flex-1 h-2 rounded ${
              step >= 1 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
          <div className="w-6"></div>
          <div
            className={`flex-1 h-2 rounded ${
              step >= 2 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Step 1: Basic Info
            </h2>
            <div className="space-y-4">
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Officer Name"
                onChange={(e) => handleChange("officerName", e.target.value)}
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Mobile Number"
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Email"
                type="email"
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Password"
                type="password"
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <select
                className="w-full p-3 border rounded-lg"
                onChange={(e) => handleChange("role", e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="rmo">RMO</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Step 2: Details
            </h2>
            <div className="space-y-4">
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Designation"
                onChange={(e) => handleChange("designation", e.target.value)}
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Area"
                onChange={(e) => handleChange("area", e.target.value)}
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Delivery Office"
                onChange={(e) => handleChange("deliveryOffice", e.target.value)}
              />
              <textarea
                className="w-full p-3 border rounded-lg"
                placeholder="Address"
                rows={3}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handlePrev}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Register ✔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
