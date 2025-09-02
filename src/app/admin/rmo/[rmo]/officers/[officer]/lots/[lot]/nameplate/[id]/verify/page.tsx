"use client";

import { useParams } from "next/navigation";

export default function VerifyNameplate() {
  const { id, lot, officer, rmo } = useParams();

  const handleVerify = async () => {
    await fetch(
      `/api/rmo/${rmo}/officers/${officer}/lots/${lot}/nameplates/${id}/verify`,
      { method: "PATCH" }
    );
    alert("✅ Nameplate verified");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Verify Nameplate {id}</h1>
      <button
        onClick={handleVerify}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Verify
      </button>
    </div>
  );
}
