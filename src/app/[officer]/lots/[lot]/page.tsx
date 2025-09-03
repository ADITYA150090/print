"use client";

import { useParams, useRouter } from "next/navigation";

export default function LotDetailPage() {
  const params = useParams();

  const officer = params.officer as string;
  const lot = params.lot as string;

  const router = useRouter();

  const handleCreateDesign = () => {
    router.push(`/${officer}/lots/${lot}/createNameplate`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 relative text-black">
      <h1 className="text-3xl font-bold mb-4">Lot: {lot}</h1>
      <p className="text-lg mb-6">Officer: {officer}</p>

      <button
        onClick={handleCreateDesign}
        className="fixed top-6 right-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Create Design
      </button>
    </div>
  );
}
