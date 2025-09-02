"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RmoDashboard() {
  const { rmo } = useParams();
  const [officers, setOfficers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/rmo/${rmo}/officers`)
      .then((res) => res.json())
      .then((data) => setOfficers(data.officers || []));
  }, [rmo]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Dashboard for {rmo}</h1>
      <ul className="space-y-2">
        {officers.map((o) => (
          <li key={o.id}>
            <Link href={`/rmo/${rmo}/officers/${o.officerNumber}`}>
              {o.officerName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
