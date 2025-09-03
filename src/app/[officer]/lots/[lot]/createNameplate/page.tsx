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

// ✅ Updated Nameplate Interface with MongoDB fields
interface Nameplate {
  id: string;
  theme: "ambuja" | "acc";
  background: string;
  houseName: string;
  ownerName: string;
  address: string;
  textColor: string;
  // New MongoDB fields
  rmo: string;
  officer: string;
  lot: string;
  officer_name: string;
  
  email: string;
  mobile_number: string;
}

// ✅ MongoDB Document Interface
interface NameplateDocument {
  rmo: string;
  officer: string;
  lot: string;
  officer_name: string;
  
  email: string;
  mobile_number: string;
  image_url: string;
  verified: boolean;
  created_at: string;
}

// ✅ API Response Interface
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  id?: string;
  data?: any;
}

export default function Page() {
  // ✅ Updated Initial State with MongoDB fields
  const [nameplates, setNameplates] = useState<Nameplate[]>([
    {
      id: "1",
      theme: "ambuja",
      background: templates.ambuja[0],
      houseName: "My Sweet Home",
      ownerName: "Aditya Dhawle",
      address: "Plot No. 21, Pune, India",
      textColor: "#FFD700",
      // MongoDB fields
      rmo: "RMO1",
      officer: "Officer1",
      lot: "Lot1",
      officer_name: "Aditya Dhawle",
      
      email: "aditya@example.com",
      mobile_number: "1234567890",
    },
  ]);
  
  const [activeNameplateId, setActiveNameplateId] = useState("1");
  const [uploading, setUploading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

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
      textColor: "#FFD700",
      // Default MongoDB fields
      rmo: "RMO1",
      officer: "Officer1",
      lot: "Lot1",
      officer_name: "Officer Name",
      
      email: "officer@example.com",
      mobile_number: "0000000000",
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
      officer_name: original.officer_name + " (Copy)",
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

  // ✅ Improved Save to MongoDB Function with Better Error Handling
  const saveToMongoDB = async (nameplateData: Nameplate, imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLastError(null);

      const mongoDocument: NameplateDocument = {
        rmo: nameplateData.rmo,
        officer: nameplateData.officer,
        lot: nameplateData.lot,
        officer_name: nameplateData.officer_name,
        
        email: nameplateData.email,
        mobile_number: nameplateData.mobile_number,
        image_url: imageUrl,
        verified: false,
        created_at: new Date().toISOString(),
      };

      console.log('📤 Sending to MongoDB:', mongoDocument);

      const response = await fetch(`/officer/lots/${lot}/createNameplate`, {
        method: 'POST',
        body: JSON.stringify(mongoDocument),
        headers: { 'Content-Type': 'application/json' }
      });

      const responseText = await response.text();
      console.log('📥 Raw API Response:', responseText);

      let result: ApiResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'API returned success: false');
      }

      console.log('✅ MongoDB Save Success:', result);
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('❌ MongoDB save error:', error);
      setLastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ Validate Nameplate Data
  const validateNameplateData = (nameplate: Nameplate): string[] => {
    const errors: string[] = [];
    
    if (!nameplate.rmo.trim()) errors.push('RMO is required');
    if (!nameplate.officer.trim()) errors.push('Officer is required');
    if (!nameplate.lot.trim()) errors.push('Lot is required');
    if (!nameplate.officer_name.trim()) errors.push('Officer Name is required');
  
    if (!nameplate.email.trim()) errors.push('Email is required');
    if (!nameplate.mobile_number.trim()) errors.push('Mobile Number is required');
    
    // Basic email validation
    if (nameplate.email.trim() && !/\S+@\S+\.\S+/.test(nameplate.email)) {
      errors.push('Invalid email format');
    }
    
    return errors;
  };

  // ✅ FIXED: Updated handleSave with proper DOM update waiting
  const handleSave = async () => {
    if (!previewRef.current) return;
    
    // Validate data
    const validationErrors = validateNameplateData(activeNameplate);
    if (validationErrors.length > 0) {
      alert(`❌ Validation Errors:\n${validationErrors.join('\n')}`);
      return;
    }

    setUploading(true);
    setLastError(null);

    try {
      // 🔥 CRITICAL FIX: Wait for DOM to update with new background image
      console.log('🎯 Current background being saved:', activeNameplate.background);
      
      // Force a small delay to ensure the Image component has loaded the new background
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Additional check: Wait for images to load
      const images = previewRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Fallback timeout
            setTimeout(resolve, 1000);
          });
        })
      );

      // Convert div → Blob (image)
      const blob = await toBlob(previewRef.current, {
        backgroundColor: "white",
        quality: 0.95,
        pixelRatio: 2,
        // 🔥 ADDITIONAL FIX: Ensure all resources are loaded
        skipFonts: false,
        useCORS: true,
        allowTaint: true,
      });

      if (!blob) {
        throw new Error("Failed to generate image");
      }

      const fileName = `nameplate-${activeNameplate.officer_name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from("Nameplate")
        .upload(fileName, blob, { upsert: false });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("Nameplate")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log("✅ Supabase Upload Success:", publicUrl);
      console.log("📸 Template saved:", activeNameplate.background);
      
      // Save to MongoDB
      const mongoResult = await saveToMongoDB(activeNameplate, publicUrl);
      
      if (mongoResult.success) {
        alert(`✅ Success!\n\n🖼️ Image uploaded to Supabase\n💾 Data saved to MongoDB\n🎨 Template: ${activeNameplate.background}\n🔗 URL: ${publicUrl}`);
      } else {
        alert(`⚠️ Partial Success:\n\n🖼️ Image uploaded to Supabase ✅\n💾 MongoDB save failed ❌\n\nError: ${mongoResult.error}\n\n🔗 Image URL: ${publicUrl}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      console.error("❌ Upload Error:", err);
      setLastError(errorMessage);
      alert(`❌ Upload Failed:\n${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ FIXED: Updated handleSaveAll with proper DOM update waiting
  const handleSaveAll = async () => {
    setUploading(true);
    setLastError(null);
    
    const results: { nameplate: string; success: boolean; error?: string; url?: string }[] = [];
    
    for (const nameplate of nameplates) {
      // Validate each nameplate
      const validationErrors = validateNameplateData(nameplate);
      if (validationErrors.length > 0) {
        results.push({
          nameplate: nameplate.officer_name,
          success: false,
          error: `Validation failed: ${validationErrors.join(', ')}`
        });
        continue;
      }

      // Switch to this nameplate
      setActiveNameplateId(nameplate.id);
      
      // 🔥 CRITICAL FIX: Wait longer for UI to update and images to load
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        if (!previewRef.current) continue;
        
        // Wait for images to load
        const images = previewRef.current.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              setTimeout(resolve, 1000); // Fallback
            });
          })
        );
        
        const blob = await toBlob(previewRef.current, {
          backgroundColor: "white",
          quality: 0.95,
          pixelRatio: 2,
          skipFonts: false,
          useCORS: true,
          allowTaint: true,
        });

        if (blob) {
          const fileName = `nameplate-${nameplate.officer_name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
          const { data, error } = await supabase.storage
            .from("Nameplate")
            .upload(fileName, blob, { upsert: false });
            
          if (!error) {
            const { data: urlData } = supabase.storage
              .from("Nameplate")
              .getPublicUrl(fileName);
            
            const mongoResult = await saveToMongoDB(nameplate, urlData.publicUrl);
            
            results.push({
              nameplate: nameplate.officer_name,
              success: mongoResult.success,
              error: mongoResult.error,
              url: urlData.publicUrl
            });
          } else {
            results.push({
              nameplate: nameplate.officer_name,
              success: false,
              error: `Supabase error: ${error.message}`
            });
          }
        }
      } catch (err: any) {
        results.push({
          nameplate: nameplate.officer_name,
          success: false,
          error: err.message || 'Unknown error'
        });
      }
    }
    
    setUploading(false);
    
    const successCount = results.filter(r => r.success).length;
    const failedResults = results.filter(r => !r.success);
    
    console.log("📊 Batch Results:", results);
    
    let message = `📊 Batch Upload Results:\n\n✅ Successful: ${successCount}/${nameplates.length}\n`;
    
    if (failedResults.length > 0) {
      message += `\n❌ Failed:\n${failedResults.map(r => `• ${r.nameplate}: ${r.error}`).join('\n')}`;
    }
    
    alert(message);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white text-black shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">🎨 Nameplate Designer</h2>

        {/* Error Display */}
        {lastError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-semibold text-red-800 text-sm">❌ Last Error:</h4>
            <p className="text-red-700 text-xs mt-1 break-words">{lastError}</p>
            <button 
              onClick={() => setLastError(null)}
              className="text-red-600 text-xs underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

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

        {/* MongoDB Fields Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-3">📋 Officer Details</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">RMO *</label>
              <input
                type="text"
                value={activeNameplate.rmo}
                onChange={(e) => updateActiveNameplate({ rmo: e.target.value })}
                className="w-full border rounded p-2 text-sm"
                placeholder="RMO1"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Officer *</label>
              <input
                type="text"
                value={activeNameplate.officer}
                onChange={(e) => updateActiveNameplate({ officer: e.target.value })}
                className="w-full border rounded p-2 text-sm"
                placeholder="Officer1"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-600">Lot *</label>
            <input
              type="text"
              value={activeNameplate.lot}
              onChange={(e) => updateActiveNameplate({ lot: e.target.value })}
              className="w-full border rounded p-2 text-sm"
              placeholder="Lot1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Email *</label>
              <input
                type="email"
                value={activeNameplate.email}
                onChange={(e) => updateActiveNameplate({ email: e.target.value })}
                className="w-full border rounded p-2 text-sm"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Mobile *</label>
              <input
                type="text"
                value={activeNameplate.mobile_number}
                onChange={(e) => updateActiveNameplate({ mobile_number: e.target.value })}
                className="w-full border rounded p-2 text-sm"
                placeholder="1234567890"
                required
              />
            </div>
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
        <div className="mb-4">
          <p className="font-semibold mb-2">Choose Template</p>
          <p className="text-xs text-gray-600 mb-3">🔥 Current: {activeNameplate.background}</p>
          <div className="grid grid-cols-2 gap-2">
            {templates[activeNameplate.theme].map((bg) => (
              <button 
                key={bg} 
                onClick={() => {
                  console.log('🎯 Template clicked:', bg);
                  updateActiveNameplate({ background: bg });
                }}
                className="relative"
              >
                <Image
                  src={bg}
                  alt="template"
                  width={100}
                  height={70}
                  className={`w-24 h-16 rounded object-cover transition-all ${
                    activeNameplate.background === bg 
                      ? "ring-3 ring-indigo-500 ring-offset-2 scale-105" 
                      : "hover:scale-102"
                  }`}
                />
                {activeNameplate.background === bg && (
                  <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1 py-0.5 rounded">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display Inputs */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎨 Display Settings</h3>
          <div className="mb-3">
            <label className="text-xs text-gray-600">Officer Name *</label>
            <input
              type="text"
              value={activeNameplate.officer_name}
              onChange={(e) => updateActiveNameplate({ 
                officer_name: e.target.value,
                ownerName: e.target.value // Sync with display name
              })}
              className="w-full border rounded p-2 text-sm"
              placeholder="John Doe"
              required
            />
          </div>
          <input
            type="text"
            placeholder="House Name (Display)"
            value={activeNameplate.houseName}
            onChange={(e) => updateActiveNameplate({ houseName: e.target.value })}
            className="w-full border rounded p-2 mb-2"
          />
          <textarea
            placeholder="Address"
            value={activeNameplate.address}
            onChange={(e) => updateActiveNameplate({ address: e.target.value })}
            className="w-full border rounded p-2 mb-4"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSave}
            disabled={uploading}
            className="w-full bg-green-600 text-white rounded p-2 hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "💾 Save to Database"}
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={uploading}
            className="w-full bg-purple-600 text-white rounded p-2 hover:bg-purple-700 disabled:opacity-50"
          >
            {uploading ? "Uploading All..." : `📤 Save All to Database (${nameplates.length})`}
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
          {/* 🔥 CRITICAL FIX: Added key prop to force re-render when background changes */}
          <Image 
            key={`${activeNameplate.id}-${activeNameplate.background}`}
            src={activeNameplate.background} 
            alt="Background" 
            fill 
            className="object-cover"
            priority={true}
            onLoad={() => console.log('🖼️ Background image loaded:', activeNameplate.background)}
          />

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
              {activeNameplate.officer_name}
            </p>
            
            <p
              className="text-lg drop-shadow-lg font-[Dancing_Script]"
              style={{ color: activeNameplate.textColor }}
            >
              {activeNameplate.address}
            </p>
          </div>
        </div>

        {/* Nameplate Thumbnails Grid */}
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
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white shadow-md">
                  <Image 
                    src={nameplate.background} 
                    alt="Background" 
                    fill 
                    className="object-cover" 
                  />
                  
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
                      {nameplate.officer_name}
                    </p>
                  </div>

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

                  {activeNameplateId === nameplate.id && (
                    <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      Active
                    </div>
                  )}
                </div>

                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {nameplate.officer_name}
                  </p>
                </div>
              </div>
            ))}

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