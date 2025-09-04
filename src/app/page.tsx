"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-900 to-green-400">
      {/* Brand Heading */}
      <h1 className="text-5xl font-extrabold text-white mb-12 drop-shadow-lg">
        PrintWorld
      </h1>

      {/* Buttons */}
      <div className="flex flex-col space-y-6 w-64">
        <button
          onClick={() => router.push("/register")}
          className="bg-white text-green-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Register
        </button>

        <button
          onClick={() => router.push("/login")}
          className="bg-transparent border-2 border-white text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-white hover:text-green-900 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
