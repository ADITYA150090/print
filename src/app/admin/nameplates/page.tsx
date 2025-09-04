"use client";

import { useEffect, useState } from "react";

interface Nameplate {
  _id: string;
  rmo: string;
  lot: string;
  houseName: string;
  ownerName: string;
  spouseName: string;
  address: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function PrintNameplatePage() {
  const [data, setData] = useState<Nameplate[]>([]);
  const [filtered, setFiltered] = useState<Nameplate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/printNameplate");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setData(result.data);
          setFiltered(result.data);
        }
      } catch (err) {
        console.error("❌ Error fetching nameplates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Filter data when search changes
  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      data.filter(
        (item) =>
          item.ownerName.toLowerCase().includes(term) ||
          item.houseName.toLowerCase().includes(term) ||
          item.rmo.toLowerCase().includes(term) ||
          item.lot.toLowerCase().includes(term)
      )
    );
  }, [search, data]);

  // ⬇️ Handle image download
  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("❌ Failed to download image:", err);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🏠 Print Nameplates
        </h1>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search by Owner, House, RMO, or Lot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading data...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No nameplates found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">RMO</th>
                  <th className="p-3 text-left">Lot</th>
                  <th className="p-3 text-left">House Name</th>
                  <th className="p-3 text-left">Owner</th>
                  <th className="p-3 text-left">Spouse</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Actions</th>
                  <th className="p-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{item.rmo}</td>
                    <td className="p-3">{item.lot}</td>
                    <td className="p-3 font-semibold">{item.houseName}</td>
                    <td className="p-3">{item.ownerName}</td>
                    <td className="p-3">{item.spouseName || "-"}</td>
                    <td className="p-3">{item.address}</td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPreviewImage(item.imageUrl)
                        }
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 active:scale-90 transition"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(
                            item.imageUrl,
                            `${item.houseName || "nameplate"}.jpg`
                          )
                        }
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-90 transition"
                      >
                        Download
                      </button>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔍 Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-3xl w-full relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
