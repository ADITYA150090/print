"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function LotPage() {
  const { rmo, officer, lot } = useParams();
  const [nameplates, setNameplates] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/rmo/${rmo}/officers/${officer}/lots/${lot}/nameplates`)
      .then((res) => res.json())
      .then((data) => setNameplates(data.nameplates || []));
  }, [rmo, officer, lot]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Lot {lot} (Officer {officer}, {rmo})
      </h1>
      <ul className="space-y-2">
        {nameplates.map((n) => (
          <li key={n.id}>
            {n.text}{" "}
            <Link
              href={`/rmo/${rmo}/officers/${officer}/lots/${lot}/nameplate/${n.id}/verify`}
              className="text-blue-600 underline"
            >
              Verify
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
