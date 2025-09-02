"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface HouseRecord {
  id: string;
  houseName: string;
  ownerName: string;
  spouseName: string;
  address: string;
  imageUrl: string;
}

export default function LotDetailsPage() {
  const { rmo, officerId, lot } = useParams() as {
    rmo: string;
    officerId: string;
    lot: string;
  };

  const [records, setRecords] = useState<HouseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // API hardcoded for now
        const res = await fetch(
          `/api/rmo/${rmo}/officers/${officerId}/lots/${lot}`
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.records)) {
          setRecords(data.records);
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [rmo, officerId, lot]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Lot <span className="text-blue-600">{lot}</span> under Officer{" "}
          <span className="text-green-600">{officerId}</span>
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading lot records...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500">No records found in this lot.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-2xl border">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Sr. No.</th>
                  <th className="px-4 py-3">House Name</th>
                  <th className="px-4 py-3">Owner Name</th>
                  <th className="px-4 py-3">Spouse Name</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">Select</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <tr
                    key={record.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {record.houseName}
                    </td>
                    <td className="px-4 py-3">{record.ownerName}</td>
                    <td className="px-4 py-3">{record.spouseName}</td>
                    <td className="px-4 py-3">{record.address}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => window.open(record.imageUrl, "_blank")}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs"
                      >
                        Preview
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
