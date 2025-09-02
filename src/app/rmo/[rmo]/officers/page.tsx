"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Officer {
  _id: string;
  officerName: string;
  officerNumber: string;
}

export default function RmoOfficersPage() {
  const params = useParams();
  const router = useRouter();
  const rmo = params?.rmo as string;

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rmo) return;

    const fetchOfficers = async () => {
      try {
        const res = await fetch(`/api/rmo/${rmo}/officers`);
        const data = await res.json();
        if (data.success) {
          setOfficers(data.officers);
          setFilteredOfficers(data.officers);
        }
      } catch (err) {
        console.error("Error fetching officers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, [rmo]);

  // Handle search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredOfficers(officers);
    } else {
      const lower = search.toLowerCase();
      setFilteredOfficers(
        officers.filter(
          (o) =>
            o.officerName.toLowerCase().includes(lower) ||
            o.officerNumber.toLowerCase().includes(lower) ||
            o._id.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, officers]);

  if (loading) return <p className="p-4">Loading officers...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-black mb-4">Officers under {rmo}</h1>

      {/* Search Bar */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by ID, Name or Number..."
        className="w-full p-2 border rounded mb-4"
      />

      {/* Officers List */}
      {filteredOfficers.length === 0 ? (
        <p>No officers found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredOfficers.map((officer) => (
            <li
              key={officer._id}
              className="p-3 border rounded shadow-sm text-black bg-red-500 cursor-pointer hover:bg-red-600 transition"
              onClick={() =>
                router.push(`/rmo/${rmo}/officers/${officer._id}/lots`)
              }
            >
              <p>
                <span className="font-semibold">ID:</span> {officer._id}
              </p>
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {officer.officerName}
              </p>
              <p>
                <span className="font-semibold">Number:</span>{" "}
                {officer.officerNumber}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
