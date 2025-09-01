"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from '@supabase/supabase-js';

import { toBlob } from "html-to-image";

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Themes & Templates
const templates: Record<string, string[]> = {
  ambuja: [
    "/backgrounds/ambuja/d1.webp",
    "/backgrounds/ambuja/d2.webp",
    "/backgrounds/ambuja/d3.webp",
    "/backgrounds/ambuja/d4.webp",
  ],
  acc: [
    "/backgrounds/acc/d1.webp",
    "/backgrounds/acc/d2.webp",
    "/backgrounds/acc/d3.webp",
    "/backgrounds/acc/d4.webp",
  ],
};

export default function Page() {
  const [theme, setTheme] = useState<"ambuja" | "acc">("ambuja");
  const [background, setBackground] = useState(templates.ambuja[0]);
  const [houseName, setHouseName] = useState("My Sweet Home");
  const [ownerName, setOwnerName] = useState("Aditya Dhawle");
  const [address, setAddress] = useState("Plot No. 21, Pune, India");
  const [uploading, setUploading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // ✅ Capture & Upload
  const handleSave = async () => {
    if (!previewRef.current) return;
    setUploading(true);
  
    try {
      // Convert div → Blob (image)
      const blob = await toBlob(previewRef.current, {
        backgroundColor: "white",
      });
  
      if (!blob) {
        alert("❌ Failed to generate image");
        setUploading(false);
        return;
      }
  
      // 1️⃣ Get officer from /api/auth/me
      const meRes = await fetch("/api/auth/me");
      const { user } = await meRes.json();
  
      if (!user || !user.officerName) {
        throw new Error("Officer name missing from /api/auth/me response");
      }
  
      // 2️⃣ Create folder based on officerName
      const officerFolder = user.officerName.replace(/\s+/g, "_").toLowerCase();
  
      const fileName = `${officerFolder}/nameplate-${Date.now()}.png`;
  
      // 3️⃣ Upload into officer’s folder in Supabase
      const { error } = await supabase.storage
        .from("Nameplate") // ✅ bucket name
        .upload(fileName, blob, { upsert: false });
  
      if (error) {
        console.error(error);
        alert("❌ Upload failed: " + error.message);
      } else {
        alert("✅ Nameplate uploaded to Supabase!");
  
        // 4️⃣ Send notification to backend
        await fetch("/api/Dashboard/rmo/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `New nameplate created by ${user.officerName}`,
            type: "success",
            userId: user.id, // 🔑 from backend
          }),
        });
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };
  
  
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white text-black shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">🎨 Nameplate Designer</h2>

        {/* Theme Selection */}
        <p className="font-semibold">Select Theme</p>
        <div className="flex gap-3 mb-4">
          {(["ambuja", "acc"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setBackground(templates[t][0]);
              }}
              className={`px-4 py-2 rounded ${
                theme === t ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Template Selection */}
        <p className="font-semibold">Choose Template</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {templates[theme].map((bg) => (
            <button key={bg} onClick={() => setBackground(bg)}>
              <Image
                src={bg}
                alt="template"
                width={100}
                height={70}
                className={`w-24 h-16 rounded object-cover ${
                  background === bg ? "ring-2 ring-indigo-500" : ""
                }`}
              />
            </button>
          ))}
        </div>

        {/* Inputs */}
        <input
          type="text"
          placeholder="House Name"
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />
        <input
          type="text"
          placeholder="Owner Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={uploading}
          className="w-full bg-green-600 text-black rounded p-2 hover:bg-green-700"
        >
          {uploading ? "Uploading..." : "Save & Upload"}
        </button>
      </div>

      {/* Preview */}
<div className="flex-1 flex items-center justify-center p-6">
  <div
    ref={previewRef}
    className="relative w-[600px] h-[400px] rounded-xl shadow-2xl overflow-hidden font-sans"
  >
    <Image src={background} alt="Background" fill className="object-cover" />

    {/* Golden Cursive Text */}
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-2">
      <h1
        className="text-4xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 
                   bg-clip-text text-transparent drop-shadow-lg font-[Great_Vibes]"
      >
        {houseName}
      </h1>
      <p
        className="text-2xl bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 
                   bg-clip-text text-transparent drop-shadow-lg font-[Dancing_Script]"
      >
        {ownerName}
      </p>
      <p
        className="text-lg bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 
                   bg-clip-text text-transparent drop-shadow-lg font-[Dancing_Script]"
      >
        {address}
      </p>
    </div>
  </div>
</div>

    </div>
  );
}
