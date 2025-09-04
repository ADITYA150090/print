"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { toBlob } from "html-to-image";
import { useParams, useRouter } from "next/navigation";

// ✅ Environment variables with fallbacks and validation
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// ✅ Conditional Supabase client creation with error handling
let supabase: any = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

// ✅ Types with proper interfaces
interface User {
  user?: {
    rmo?: string;
    officerNumber?: string;
    officerName?: string;
    email?: string;
    mobileNumber?: string;
  };
  rmo?: string;
  officerNumber?: string;
  officerName?: string;
  email?: string;
  mobileNumber?: string;
}

interface Nameplate {
  id: string;
  theme: "ambuja" | "acc";
  background: string;
  houseName: string;
  ownerName: string;
  address: string;
  houseNameColor: string;
  houseNameSize: number;
  ownerNameColor: string;
  ownerNameSize: number;
  addressColor: string;
  addressSize: number;
  rmo: string;
  officer: string;
  lot: string;
  officer_name: string;
  email: string;
  mobileNumber: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  id?: string;
  data?: any;
}

// ✅ Constants moved outside component for better performance
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

const COLOR_PRESETS = [
  { name: "Gold", color: "#FFD700" },
  { name: "red", color: "rgb(204, 0, 26)" },
  { name: "White", color: "#FFFFFF" },
  { name: "Black", color: "#000000" },
];

// ✅ Default nameplate factory function
const createDefaultNameplate = (id: string, lot?: string): Nameplate => ({
  id,
  theme: "ambuja",
  background: templates.ambuja[0],
  houseName: "My Sweet Home",
  ownerName: "Sample Name",
  address: "Plot No. 21, Pune, India",
  houseNameColor: "#FFD700",
  houseNameSize: 18,
  ownerNameColor: "#FFD700",
  ownerNameSize: 40,
  addressColor: "#FFD700",
  addressSize: 18,
  rmo: "",
  officer: "",
  lot: lot || "",
  officer_name: "",
  email: "",
  mobileNumber: "",
});

export default function NameplateDesigner() {
  const params = useParams();
  const router = useRouter();

  // ✅ State management with proper typing
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [nameplates, setNameplates] = useState<Nameplate[]>(() => [
    createDefaultNameplate("1", params.lot as string)
  ]);
  
  const [activeNameplateId, setActiveNameplateId] = useState("1");
  const [activeTextField, setActiveTextField] = useState<"houseName" | "ownerName" | "address" | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);

  // ✅ Memoized active nameplate
  const activeNameplate = nameplates.find((n) => n.id === activeNameplateId) || nameplates[0];

  // ✅ User authentication with error handling
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch user data`);
        }
        
        const data: User = await res.json();
        setUser(data);
        setError(null);
      } catch (err: any) {
        console.error("User fetch error:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  // ✅ Update nameplates when user data loads
  useEffect(() => {
    if (user) {
      const userData = user.user || user;
      setNameplates((prev) =>
        prev.map((n) => ({
          ...n,
          rmo: userData.rmo || "",
          officer: userData.officerNumber || "",
          officer_name: userData.officerName || "",
          email: userData.email || "",
          mobileNumber: userData.mobileNumber || "",
        }))
      );
    }
  }, [user]);

  // ✅ Utility functions
  const updateActiveNameplate = (updates: Partial<Nameplate>) => {
    setNameplates((prev) =>
      prev.map((nameplate) =>
        nameplate.id === activeNameplateId
          ? { ...nameplate, ...updates }
          : nameplate
      )
    );
  };

  const addNewNameplate = () => {
    const newId = Date.now().toString();
    const newNameplate = createDefaultNameplate(newId, activeNameplate.lot);
    
    // Copy user details from active nameplate
    const newNameplateWithUserData: Nameplate = {
      ...newNameplate,
      theme: activeNameplate.theme,
      rmo: activeNameplate.rmo,
      officer: activeNameplate.officer,
      lot: activeNameplate.lot,
      officer_name: activeNameplate.officer_name,
      email: activeNameplate.email,
      mobileNumber: activeNameplate.mobileNumber,
    };

    setNameplates(prev => [...prev, newNameplateWithUserData]);
    setActiveNameplateId(newId);
  };

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

  const handleThemeChange = (newTheme: "ambuja" | "acc") => {
    updateActiveNameplate({
      theme: newTheme,
      background: templates[newTheme][0],
    });
  };

  // ✅ Validation with better error messages
  const validateNameplateData = (nameplate: Nameplate): string[] => {
    const errors: string[] = [];
    
    if (!nameplate.rmo?.trim()) errors.push("RMO is required");
    if (!nameplate.officer?.trim()) errors.push("Officer is required");
    if (!nameplate.lot?.trim()) errors.push("Lot is required");
    if (!nameplate.officer_name?.trim()) errors.push("Officer Name is required");
    if (!nameplate.email?.trim()) errors.push("Email is required");
    if (!nameplate.mobileNumber?.trim()) errors.push("Mobile Number is required");

    // Email validation
    if (nameplate.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nameplate.email)) {
      errors.push("Invalid email format");
    }

    // Mobile number validation (basic)
    if (nameplate.mobileNumber?.trim() && !/^\d{10,15}$/.test(nameplate.mobileNumber.replace(/\s+/g, ''))) {
      errors.push("Mobile number should be 10-15 digits");
    }

    return errors;
  };

  // ✅ MongoDB save with better error handling
  const saveToMongoDB = async (nameplateData: Nameplate, imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLastError(null);

      if (!nameplateData.officer || !nameplateData.lot) {
        throw new Error("Missing required fields: officer and lot");
      }

      const mongoDocument = {
        theme: nameplateData.theme,
        background: nameplateData.background,
        houseName: nameplateData.houseName,
        ownerName: nameplateData.ownerName,
        address: nameplateData.address,
        houseNameColor: nameplateData.houseNameColor,
        houseNameSize: nameplateData.houseNameSize,
        ownerNameColor: nameplateData.ownerNameColor,
        ownerNameSize: nameplateData.ownerNameSize,
        addressColor: nameplateData.addressColor,
        addressSize: nameplateData.addressSize,
        rmo: nameplateData.rmo,
        officer: nameplateData.officer,
        lot: nameplateData.lot,
        officer_name: nameplateData.officer_name,
        email: nameplateData.email,
        mobile_number: nameplateData.mobileNumber,
        image_url: imageUrl,
        designation: nameplateData.officer_name,
      };

      console.log('📤 Sending to MongoDB:', mongoDocument);

      const response = await fetch(
        `/api/${nameplateData.officer}/lots/${nameplateData.lot}/createNameplate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mongoDocument),
        }
      );

      const responseText = await response.text();
      console.log('📥 Raw API Response:', responseText);

      let result: ApiResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}...`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || result.message || 'Unknown error'}`);
      }

      if (!result.success) {
        throw new Error(result.error || result.message || 'API returned success: false');
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

  // ✅ Image generation with better error handling
  const generateImage = async (element: HTMLDivElement): Promise<Blob> => {
    // Wait for all images to load
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve(null), 5000); // 5s timeout
          img.onload = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load image: ${img.src}`));
          };
        });
      })
    );

    // Generate blob with error handling
    const blob = await toBlob(element, {
      backgroundColor: "white",
      quality: 0.95,
      pixelRatio: 2,
      skipFonts: false,
    });

    if (!blob) {
      throw new Error("Failed to generate image blob");
    }

    return blob;
  };

  // ✅ Supabase upload with better error handling
  const uploadToSupabase = async (blob: Blob, fileName: string): Promise<string> => {
    if (!supabase) {
      throw new Error("Supabase client not initialized. Please check environment variables.");
    }

    try {
      const { data, error } = await supabase.storage
        .from("Nameplate")
        .upload(fileName, blob, { upsert: false });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("Nameplate")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL from Supabase");
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  // ✅ Single save with comprehensive error handling
  const handleSave = async () => {
    if (!previewRef.current) {
      alert("Preview element not found. Please try again.");
      return;
    }
    
    const validationErrors = validateNameplateData(activeNameplate);
    if (validationErrors.length > 0) {
      alert(`❌ Validation Errors:\n${validationErrors.join('\n')}`);
      return;
    }

    if (!supabase) {
      alert("❌ Upload service not available. Please check configuration.");
      return;
    }

    setUploading(true);
    setLastError(null);

    try {
      console.log('🎯 Current background being saved:', activeNameplate.background);
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate image
      const blob = await generateImage(previewRef.current);
      console.log('✅ Image blob generated successfully');

      // Upload to Supabase
      const fileName = `nameplate-${activeNameplate.officer_name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
      const publicUrl = await uploadToSupabase(blob, fileName);
      console.log("✅ Supabase Upload Success:", publicUrl);
      
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

  // ✅ Batch save with better progress tracking
  const handleSaveAll = async () => {
    if (!supabase) {
      alert("❌ Upload service not available. Please check configuration.");
      return;
    }

    setUploading(true);
    setLastError(null);
    
    const results: { nameplate: string; success: boolean; error?: string; url?: string }[] = [];
    
    for (let i = 0; i < nameplates.length; i++) {
      const nameplate = nameplates[i];
      
      // Validate each nameplate
      const validationErrors = validateNameplateData(nameplate);
      if (validationErrors.length > 0) {
        results.push({
          nameplate: nameplate.officer_name || `Nameplate ${i + 1}`,
          success: false,
          error: `Validation failed: ${validationErrors.join(', ')}`
        });
        continue;
      }

      console.log(`🎯 Processing nameplate ${i + 1}/${nameplates.length}:`, nameplate.officer_name);

      try {
        // Switch to this nameplate
        setActiveNameplateId(nameplate.id);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Longer wait for batch processing
        
        if (!previewRef.current) {
          throw new Error('Preview ref not available');
        }

        // Generate and upload image
        const blob = await generateImage(previewRef.current);
        const fileName = `nameplate-${nameplate.officer_name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
        const publicUrl = await uploadToSupabase(blob, fileName);
        console.log('📤 Uploaded to:', publicUrl);
        
        // Save to MongoDB
        const mongoResult = await saveToMongoDB(nameplate, publicUrl);
        
        results.push({
          nameplate: nameplate.officer_name || `Nameplate ${i + 1}`,
          success: mongoResult.success,
          error: mongoResult.error,
          url: publicUrl
        });

      } catch (err: any) {
        console.error(`❌ Error processing ${nameplate.officer_name}:`, err);
        results.push({
          nameplate: nameplate.officer_name || `Nameplate ${i + 1}`,
          success: false,
          error: err.message || 'Unknown error'
        });
      }
      
      // Delay between nameplates to prevent overwhelming the system
      if (i < nameplates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
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
    
    const successfulUploads = results.filter(r => r.success && r.url);
    if (successfulUploads.length > 0) {
      message += `\n\n🔗 Uploaded Files:\n${successfulUploads.map(r => `• ${r.nameplate}`).join('\n')}`;
    }
    
    alert(message);
  };

  // ✅ Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white text-black shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">🎨 Nameplate Designer</h2>

        {/* Error Display */}
        {(error || lastError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-semibold text-red-800 text-sm">❌ Error:</h4>
            <p className="text-red-700 text-xs mt-1 break-words">{error || lastError}</p>
            <button 
              onClick={() => {
                setError(null);
                setLastError(null);
              }}
              className="text-red-600 text-xs underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Service Status */}
        {!supabase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-800 text-sm">⚠️ Configuration Issue:</h4>
            <p className="text-yellow-700 text-xs mt-1">Upload service unavailable. Please check environment variables.</p>
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

        {/* Theme Selection */}
        <div>
          <p className="font-semibold">Select Theme</p>
          <div className="flex gap-3 mb-4">
            {(["ambuja", "acc"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`px-4 py-2 rounded ${
                  activeNameplate.theme === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Text Editing Panel */}
        <div className="mb-4">
          <p className="font-semibold mb-2">Text Editing</p>
          
          {activeTextField && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Editing:{" "}
                {activeTextField === "houseName"
                  ? "House Name"
                  : activeTextField === "ownerName"
                  ? "Owner Name"
                  : "Address"}
              </p>
              
              {/* Color Selection */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Color:</p>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const currentColor =
                      activeTextField === "houseName"
                        ? activeNameplate.houseNameColor
                        : activeTextField === "ownerName"
                        ? activeNameplate.ownerNameColor
                        : activeNameplate.addressColor;
                    
                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          if (activeTextField === "houseName") {
                            updateActiveNameplate({ houseNameColor: preset.color });
                          } else if (activeTextField === "ownerName") {
                            updateActiveNameplate({ ownerNameColor: preset.color });
                          } else {
                            updateActiveNameplate({ addressColor: preset.color });
                          }
                        }}
                        className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                          currentColor === preset.color
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Font Size */}
              <div className="mt-4">
                <label className="block text-sm font-medium">
                  Font Size:{" "}
                  {activeTextField === "houseName"
                    ? activeNameplate.houseNameSize
                    : activeTextField === "ownerName"
                    ? activeNameplate.ownerNameSize
                    : activeNameplate.addressSize}{" "}
                  px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={
                    activeTextField === "houseName"
                      ? activeNameplate.houseNameSize
                      : activeTextField === "ownerName"
                      ? activeNameplate.ownerNameSize
                      : activeNameplate.addressSize
                  }
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    if (activeTextField === "houseName") {
                      updateActiveNameplate({ houseNameSize: newSize });
                    } else if (activeTextField === "ownerName") {
                      updateActiveNameplate({ ownerNameSize: newSize });
                    } else if (activeTextField === "address") {
                      updateActiveNameplate({ addressSize: newSize });
                    }
                  }}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => setActiveTextField(null)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-3"
              >
                ✕ Done Editing
              </button>
            </div>
          )}

          {!activeTextField && (
            <p className="text-xs text-gray-500 mb-2">
              Click on a text input below to edit its color and size.
            </p>
          )}
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

        {/* Display Settings */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎨 Display Settings</h3>
          <div className="mb-3">
            <label className="text-xs text-gray-600">Owner Name *</label>
            <input
              type="text"
              value={activeNameplate.officer_name}
              onChange={(e) =>
                updateActiveNameplate({
                  officer_name: e.target.value,
                  ownerName: e.target.value,
                })
              }
              onFocus={() => setActiveTextField("ownerName")}
              className={`w-full border rounded p-2 text-sm transition-all ${
                activeTextField === "ownerName"
                  ? "border-blue-500 ring-1 ring-blue-200"
                  : "border-gray-300"
              }`}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-600">House Name</label>
            <input
              type="text"
              placeholder="House Name (Display)"
              value={activeNameplate.houseName}
              onChange={(e) => updateActiveNameplate({ houseName: e.target.value })}
              onFocus={() => setActiveTextField("houseName")}
              className={`w-full border rounded p-2 text-sm transition-all ${
                activeTextField === "houseName"
                  ? "border-blue-500 ring-1 ring-blue-200"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-600">Address</label>
            <textarea
              placeholder="Address"
              value={activeNameplate.address}
              onChange={(e) => updateActiveNameplate({ address: e.target.value })}
              onFocus={() => setActiveTextField("address")}
              className={`w-full border rounded p-2 text-sm transition-all ${
                activeTextField === "address"
                  ? "border-blue-500 ring-1 ring-blue-200"
                  : "border-gray-300"
              }`}
              rows={2}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSave}
            disabled={uploading || !supabase}
            className="w-full bg-green-600 text-white rounded p-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "💾 Save to Database"}
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={uploading || !supabase || nameplates.length === 0}
            className="w-full bg-purple-600 text-white rounded p-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading All..." : `📤 Save All to Database (${nameplates.length})`}
          </button>
        </div>

        {/* User Info (for debugging) */}
        {process.env.NODE_ENV === 'development' && user && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p>RMO: {user.rmo || user.user?.rmo || 'N/A'}</p>
            <p>Officer: {user.officerNumber || user.user?.officerNumber || 'N/A'}</p>
            <p>Lot: {params.lot as string || 'N/A'}</p>
          </div>
        )}
      </div>
      
      {/* Preview Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Main Preview */}
        <div
          ref={previewRef}
          className="relative w-[600px] h-[400px] rounded-xl shadow-2xl overflow-hidden font-sans mb-6"
        >
          <Image 
            key={`${activeNameplate.id}-${activeNameplate.background}`}
            src={activeNameplate.background} 
            alt="Background" 
            fill 
            className="object-cover"
            priority={true}
            onLoad={() => console.log('🖼️ Background image loaded:', activeNameplate.background)}
            onError={() => console.error('❌ Failed to load background:', activeNameplate.background)}
          />

          <div className="absolute inset-0 px-6 space-y-2">
            <h1
              className="absolute text-lg font-bold drop-shadow-lg font-[Great_Vibes] top-10 right-20"
              style={{ 
                color: activeNameplate.houseNameColor,
                fontSize: `${activeNameplate.houseNameSize}px`
              }}
            >
              {activeNameplate.houseName}
            </h1>
            <p
              className="absolute drop-shadow-lg font-[Dancing_Script] top-[50%] right-[50%] whitespace-nowrap"
              style={{ 
                color: activeNameplate.ownerNameColor,
                fontSize: `${activeNameplate.ownerNameSize}px`,
                transform: 'translate(50%, -50%)'
              }}
            >
              {activeNameplate.officer_name}
            </p>
            
            <p
              className="absolute drop-shadow-lg font-[Dancing_Script] bottom-10 right-[50%]"
              style={{ 
                color: activeNameplate.addressColor,
                fontSize: `${activeNameplate.addressSize}px`,
                transform: 'translateX(50%)'
              }}
            >
              {activeNameplate.address}
            </p>
          </div>
        </div>

        {/* Nameplate Grid */}
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
                    onError={() => console.error('❌ Failed to load thumbnail:', nameplate.background)}
                  />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                    <h4 
                      className="text-xs font-bold drop-shadow truncate w-full"
                      style={{ color: nameplate.houseNameColor }}
                    >
                      {nameplate.houseName}
                    </h4>
                    <p 
                      className="text-xs drop-shadow truncate w-full"
                      style={{ color: nameplate.ownerNameColor }}
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
                          if (confirm(`Delete nameplate for ${nameplate.officer_name}?`)) {
                            deleteNameplate(nameplate.id);
                          }
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
                    {nameplate.officer_name || 'Unnamed'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {nameplate.theme.toUpperCase()} • Lot {nameplate.lot || 'N/A'}
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

        {/* Upload Progress */}
        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Processing nameplates...</p>
              <p className="text-sm text-gray-500 mt-2">Please don't close this window</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}