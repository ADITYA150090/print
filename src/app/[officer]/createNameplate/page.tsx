"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
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

// ✅ Nameplate Interface
interface Nameplate {
  id: string;
  theme: "ambuja" | "acc";
  background: string;
  houseName: string;
  ownerName: string;
  address: string;
  textColor: string;
}

export default function Page() {
  // ✅ Multiple Nameplates State
  const [nameplates, setNameplates] = useState<Nameplate[]>([
    {
      id: "1",
      theme: "ambuja",
      background: templates.ambuja[0],
      houseName: "My Sweet Home",
      ownerName: "Aditya Dhawle",
      address: "Plot No. 21, Pune, India",
      textColor: "#FFD700", // Default golden color
    },
  ]);
  
  const [activeNameplateId, setActiveNameplateId] = useState("1");
  const [uploading, setUploading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // ✅ Get Active Nameplate
  const activeNameplate = nameplates.find(n => n.id === activeNameplateId) || nameplates[0];

  // ✅ Update Active Nameplate
  const updateActiveNameplate = (updates: Partial<Nameplate>) => {
    setNameplates(prev => 
      prev.map(nameplate => 
        nameplate.id === activeNameplateId 
          ? { ...nameplate, ...updates }
          : nameplate
      )
    );
  };

  // ✅ Add New Nameplate
  const addNewNameplate = () => {
    const newId = Date.now().toString();
    const newNameplate: Nameplate = {
      id: newId,
      theme: "ambuja",
      background: templates.ambuja[0],
      houseName: "New House",
      ownerName: "Owner Name",
      address: "Address Here",
      textColor: "#FFD700", // Default golden color
    };
    setNameplates(prev => [...prev, newNameplate]);
    setActiveNameplateId(newId);
  };

  // ✅ Delete Nameplate
  const deleteNameplate = (id: string) => {
    if (nameplates.length === 1) {
      alert("At least one nameplate is required!");
      return;
    }
    
    setNameplates(prev => prev.filter(n => n.id !== id));
    
    // If deleting active nameplate, switch to first available
    if (id === activeNameplateId) {
      const remaining = nameplates.filter(n => n.id !== id);
      setActiveNameplateId(remaining[0]?.id || "");
    }
  };

  // ✅ Duplicate Nameplate
  const duplicateNameplate = (id: string) => {
    const original = nameplates.find(n => n.id === id);
    if (!original) return;

    const newId = Date.now().toString();
    const duplicated: Nameplate = {
      ...original,
      id: newId,
      houseName: original.houseName + " (Copy)",
    };
    
    setNameplates(prev => [...prev, duplicated]);
    setActiveNameplateId(newId);
  };

  // ✅ Handle Theme Change
  const handleThemeChange = (newTheme: "ambuja" | "acc") => {
    updateActiveNameplate({
      theme: newTheme,
      background: templates[newTheme][0],
    });
  };

  // ✅ Capture & Upload Current Nameplate
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

      const fileName = `nameplate-${activeNameplate.houseName}-${Date.now()}.png`;

      const { error } = await supabase.storage
        .from("Nameplate")
        .upload(fileName, blob, { upsert: false });

      if (error) {
        console.error(error);
        alert("❌ Upload failed: " + error.message);
      } else {
        alert("✅ Nameplate uploaded to Supabase!");
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save All Nameplates
  const handleSaveAll = async () => {
    setUploading(true);
    let successCount = 0;
    
    for (const nameplate of nameplates) {
      // Temporarily switch to this nameplate for capture
      setActiveNameplateId(nameplate.id);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        if (!previewRef.current) continue;
        
        const blob = await toBlob(previewRef.current, {
          backgroundColor: "white",
        });

        if (blob) {
          const fileName = `nameplate-${nameplate.houseName}-${Date.now()}.png`;
          const { error } = await supabase.storage
            .from("Nameplate")
            .upload(fileName, blob, { upsert: false });
            
          if (!error) successCount++;
        }
      } catch (err) {
        console.error("Error saving nameplate:", err);
      }
    }
    
    setUploading(false);
    alert(`✅ ${successCount}/${nameplates.length} nameplates uploaded successfully!`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white text-black shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">🎨 Nameplate Designer</h2>

        {/* Nameplate Management */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Nameplates ({nameplates.length})</p>
            <button
              onClick={addNewNameplate}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              + Add New
            </button>
          </div>
          
          
        </div>

        {/* Theme Selection */}
        <p className="font-semibold">Select Theme</p>
        <div className="flex gap-3 mb-4">
          {(["ambuja", "acc"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`px-4 py-2 rounded ${
                activeNameplate.theme === t ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Text Color Selection */}
        <div className="mb-4">
          <p className="font-semibold mb-2">Text Color</p>
          <div className="space-y-3">
            {/* Color Picker */}
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeNameplate.textColor}
                onChange={(e) => updateActiveNameplate({ textColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-indigo-400 transition-colors"
                title="Pick custom color"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Custom Color</p>
                <p className="text-xs text-gray-500">{activeNameplate.textColor}</p>
              </div>
            </div>

            {/* Quick Color Presets */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Quick Presets:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Gold", color: "#FFD700" },
                  { name: "Silver", color: "#C0C0C0" },
                  { name: "Rose Gold", color: "#E8B4B8" },
                  { name: "Blue", color: "#4F46E5" },
                  { name: "Green", color: "#059669" },
                  { name: "Purple", color: "#7C3AED" },
                  { name: "Red", color: "#DC2626" },
                  { name: "White", color: "#FFFFFF" },
                  { name: "Black", color: "#000000" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateActiveNameplate({ textColor: preset.color })}
                    className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                      activeNameplate.textColor === preset.color
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <p className="font-semibold">Choose Template</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {templates[activeNameplate.theme].map((bg) => (
            <button key={bg} onClick={() => updateActiveNameplate({ background: bg })}>
              <Image
                src={bg}
                alt="template"
                width={100}
                height={70}
                className={`w-24 h-16 rounded object-cover ${
                  activeNameplate.background === bg ? "ring-2 ring-indigo-500" : ""
                }`}
              />
            </button>
          ))}
        </div>

        {/* Inputs */}
        <input
          type="text"
          placeholder="House Name"
          value={activeNameplate.houseName}
          onChange={(e) => updateActiveNameplate({ houseName: e.target.value })}
          className="w-full border rounded p-2 mb-2"
        />
        <input
          type="text"
          placeholder="Owner Name"
          value={activeNameplate.ownerName}
          onChange={(e) => updateActiveNameplate({ ownerName: e.target.value })}
          className="w-full border rounded p-2 mb-2"
        />
        <textarea
          placeholder="Address"
          value={activeNameplate.address}
          onChange={(e) => updateActiveNameplate({ address: e.target.value })}
          className="w-full border rounded p-2 mb-4"
        />

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSave}
            disabled={uploading}
            className="w-full bg-green-600 text-white rounded p-2 hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "💾 Save Current Nameplate"}
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={uploading}
            className="w-full bg-purple-600 text-white rounded p-2 hover:bg-purple-700 disabled:opacity-50"
          >
            {uploading ? "Uploading All..." : `📤 Save All Nameplates (${nameplates.length})`}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Current Nameplate Preview */}
        <div
          ref={previewRef}
          className="relative w-[600px] h-[400px] rounded-xl shadow-2xl overflow-hidden font-sans mb-6"
        >
          <Image src={activeNameplate.background} alt="Background" fill className="object-cover" />

          {/* Text with Custom Color */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-2">
            <h1
              className="text-4xl font-bold drop-shadow-lg font-[Great_Vibes]"
              style={{ color: activeNameplate.textColor }}
            >
              {activeNameplate.houseName}
            </h1>
            <p
              className="text-2xl drop-shadow-lg font-[Dancing_Script]"
              style={{ color: activeNameplate.textColor }}
            >
              {activeNameplate.ownerName}
            </p>
            <p
              className="text-lg drop-shadow-lg font-[Dancing_Script]"
              style={{ color: activeNameplate.textColor }}
            >
              {activeNameplate.address}
            </p>
          </div>
        </div>

        {/* Nameplate Thumbnails Grid (Like Canva) */}
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">All Nameplates</h3>
            <span className="text-sm text-gray-600">{nameplates.length} designs</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nameplates.map((nameplate) => (
              <div
                key={nameplate.id}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  activeNameplateId === nameplate.id
                    ? "ring-3 ring-indigo-500 scale-105"
                    : "hover:scale-102 hover:shadow-lg"
                }`}
                onClick={() => setActiveNameplateId(nameplate.id)}
              >
                {/* Thumbnail Preview */}
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white shadow-md">
                  <Image 
                    src={nameplate.background} 
                    alt="Background" 
                    fill 
                    className="object-cover" 
                  />
                  
                  {/* Mini Text Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                    <h4 
                      className="text-xs font-bold drop-shadow truncate w-full"
                      style={{ color: nameplate.textColor }}
                    >
                      {nameplate.houseName}
                    </h4>
                    <p 
                      className="text-xs drop-shadow truncate w-full"
                      style={{ color: nameplate.textColor }}
                    >
                      {nameplate.ownerName}
                    </p>
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateNameplate(nameplate.id);
                      }}
                      className="bg-white/80 hover:bg-white text-gray-700 rounded p-1 text-xs shadow"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    {nameplates.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNameplate(nameplate.id);
                        }}
                        className="bg-white/80 hover:bg-white text-red-600 rounded p-1 text-xs shadow"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {activeNameplateId === nameplate.id && (
                    <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      Active
                    </div>
                  )}
                </div>

                {/* Nameplate Info */}
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {nameplate.houseName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {nameplate.theme.toUpperCase()} • {nameplate.ownerName}
                  </p>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <div
              onClick={addNewNameplate}
              className="relative w-full h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition-all duration-200 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600"
            >
              <div className="text-2xl mb-1">+</div>
              <p className="text-sm font-medium">Add New</p>
              <p className="text-xs">Nameplate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}