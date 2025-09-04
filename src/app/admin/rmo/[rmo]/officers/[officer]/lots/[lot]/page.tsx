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
  const { rmo, officer, lot } = useParams() as {
    rmo: string;
    officer: string;
    lot: string;
  };

  const [records, setRecords] = useState<HouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(
          `/api/rmo/${rmo}/officers/${officer}/lots/${lot}`
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.records)) {
          setRecords(data.records);
        } else {
          setRecords([]);
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [rmo, officer, lot]);

  const handleSendToPrint = async () => {
    try {
      setSending(true);
      const res = await fetch("/api/admin/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rmo, officer, lot, records }),
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ Data sent to print successfully!");
      } else {
        alert(`❌ Print request failed: ${result.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Print API error:", err);
      alert("❌ Failed to send data to print API");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Lot <span className="text-blue-600">{lot}</span> under Officer{" "}
          <span className="text-green-600">{officer}</span>
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
                  {/* <th className="px-4 py-3">Preview</th> */}
                  {/* <th className="px-4 py-3">Select</th> */}
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{record.houseName}</td>
                    <td className="px-4 py-3">{record.ownerName}</td>
                    <td className="px-4 py-3">{record.spouseName}</td>
                    <td className="px-4 py-3">{record.address}</td>
                    {/* <td className="px-4 py-3">
                      <button
                        onClick={() => window.open(record.imageUrl, "_blank")}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs"
                      >
                        Preview
                      </button>
                    </td> */}
                    {/* <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="w-4 h-4" />
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <button
          onClick={handleSendToPrint}
          disabled={sending}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition"
        >
          {sending ? "Sending..." : "Send to Print"}
        </button>
      )}
    </div>
  );
}
