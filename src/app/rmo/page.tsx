"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RmoLandingPage() {
  const [rmos, setRmos] = useState<string[]>([]);

  useEffect(() => {
    // Fake list of RMOs
    setRmos(["RMO1", "RMO2", "RMO3"]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">All RMOs</h1>
      <ul className="space-y-2">
        {rmos.map((rmo) => (
          <li key={rmo}>
            <Link href={`/rmo/${rmo}`} className="text-blue-600 underline">
              {rmo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
