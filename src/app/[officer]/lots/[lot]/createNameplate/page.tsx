"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { toBlob } from "html-to-image";

import { useParams, useRouter } from "next/navigation";

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

// ✅ 4 Color Palette
const COLOR_PRESETS = [
  { name: "Gold", color: "#FFD700" },
  { name: "red", color: "rgb(204, 0, 26)" },
  { name: "White", color: "#FFFFFF" },
  { name: "Black", color: "#000000" },
];

// ✅ Updated Nameplate Interface with individual text properties
interface Nameplate {
  id: string;
  theme: "ambuja" | "acc";
  background: string;
  houseName: string;
  ownerName: string;
  address: string;
  // Individual text properties
  houseNameColor: string;
  houseNameSize: number;
  ownerNameColor: string;
  ownerNameSize: number;
  addressColor: string;
  addressSize: number;
  // MongoDB fields
  rmo: string;
  officer: string;
  lot: string;
  officer_name: string;
  email: string;
  mobileNumber: string;
}

// ✅ MongoDB Document Interface
interface NameplateDocument {
  rmo: string;
  officer: string;
  lot: string;
  officer_name: string;
  email: string;
  mobileNumber: string;
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
  const params = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data: User = await res.json();
        setUser(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Updated Initial State
  const [nameplates, setNameplates] = useState<Nameplate[]>([
    {
      id: "1",
      theme: "ambuja",
      background: templates.ambuja[0],
      houseName: "My Sweet Home",
      ownerName: "Aditya Dhawle",
      address: "Plot No. 21, Pune, India",
      houseNameColor: "#FFD700",
      houseNameSize: 18,
      ownerNameColor: "#FFD700",
      ownerNameSize: 40,
      addressColor: "#FFD700",
      addressSize: 18,
      rmo: "",
      officer: "",
      lot: (params.lot as string) ?? "",
      officer_name: "",
      email: "",
      mobileNumber: "",
    },
  ]);

  // ✅ Active text field for editing - RE-ADDED
  const [activeTextField, setActiveTextField] = useState<
    "houseName" | "ownerName" | "address" | null
  >(null);

  useEffect(() => {
    if (user) {
      setNameplates((prev) =>
        prev.map((n) => ({
          ...n,
          rmo: user.rmo ?? "",
          officer: user.officerNumber ?? "",
          officer_name: user.officerName ?? "",
          email: user.email ?? "",
          mobileNumber: user.mobileNumber ?? "",
        }))
      );
    }
  }, [user]);

  const [activeNameplateId, setActiveNameplateId] = useState("1");
  const [uploading, setUploading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeNameplate =
    nameplates.find((n) => n.id === activeNameplateId) || nameplates[0];

  const updateActiveNameplate = (updates: Partial<Nameplate>) => {
    setNameplates((prev) =>
      prev.map((nameplate) =>
        nameplate.id === activeNameplateId
          ? { ...nameplate, ...updates }
          : nameplate
      )
    );
  };

  // Functions for addNewNameplate, deleteNameplate, duplicateNameplate, handleThemeChange, saveToMongoDB, validateNameplateData, handleSave, handleSaveAll remain the same as your original full code.
  // ... (All other functions from your code are assumed to be here)
   // ✅ Add New Nameplate
  const addNewNameplate = () => {
    const newId = Date.now().toString();

    const newNameplate: Nameplate = {
      id: newId,
      theme: activeNameplate.theme,
      background: templates[activeNameplate.theme][0],
      houseName: "New House",
      ownerName: "Owner Name",
      address: "Address Here",
      // Default individual text properties
      houseNameColor: "#FFD700",
      houseNameSize: 18,
      ownerNameColor: "#FFD700",
      ownerNameSize: 40,
      addressColor: "#FFD700",
      addressSize: 18,
      // Copy user details
      rmo: activeNameplate.rmo,
      officer: activeNameplate.officer,
      lot: activeNameplate.lot,
      officer_name: activeNameplate.officer_name,
      email: activeNameplate.email,
      mobileNumber: activeNameplate.mobileNumber,
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

      const mongoDocument = {
        theme: nameplateData.theme,
        background: nameplateData.background,
        houseName: nameplateData.houseName,
        ownerName: nameplateData.ownerName,
        address: nameplateData.address,
        // Save individual text properties
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

        // Backend expects these exact names:
        mobile_number: nameplateData.mobileNumber,
        image_url: imageUrl, // 🔥 from Supabase
        designation: nameplateData.officer_name, // or any value you want
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

  const validateNameplateData = (nameplate: Nameplate): string[] => {
    const errors: string[] = [];
    
    if (!(nameplate.rmo ?? "").trim()) errors.push("RMO is required");
    if (!(nameplate.officer ?? "").trim()) errors.push("Officer is required");
    if (!(nameplate.lot ?? "").trim()) errors.push("Lot is required");
    if (!(nameplate.officer_name ?? "").trim()) errors.push("Officer Name is required");
    if (!(nameplate.email ?? "").trim()) errors.push("Email is required");
    if (!(nameplate.mobileNumber ?? "").trim()) errors.push("Mobile Number is required");

    if ((nameplate.email ?? "").trim() && !/\S+@\S+\.\S+/.test(nameplate.email)) {
      errors.push("Invalid email format");
    }

    // imageUrl is optional during validation
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

  const handleSaveAll = async () => {
    setUploading(true);
    setLastError(null);
    
    const results: { nameplate: string; success: boolean; error?: string; url?: string }[] = [];
    
    for (let i = 0; i < nameplates.length; i++) {
      const nameplate = nameplates[i];
      
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

      console.log(`🎯 Processing nameplate ${i + 1}/${nameplates.length}:`, nameplate.officer_name);
      console.log('🖼️ Expected background:', nameplate.background);

      try {
        // 🔥 STEP 1: Switch to this nameplate
        setActiveNameplateId(nameplate.id);
        
        // 🔥 STEP 2: Wait for React to re-render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!previewRef.current) {
          throw new Error('Preview ref not available');
        }

        // 🔥 STEP 3: FORCE background image to reload by updating the Image component
        const imageElement = previewRef.current.querySelector('img') as HTMLImageElement;
        if (imageElement) {
          console.log('🔄 Current image src before update:', imageElement.src);
          
          // Create a promise that resolves when the correct image loads
          const waitForCorrectImage = new Promise<void>((resolve, reject) => {
            const targetBackground = nameplate.background;
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkImage = () => {
              attempts++;
              console.log(`🔍 Attempt ${attempts}: Checking if image matches ${targetBackground}`);
              console.log('📷 Current image src:', imageElement.src);
              
              // Check if the current image src contains our target background
              const isCorrectImage = imageElement.src.includes(targetBackground.replace('/backgrounds/', ''));
              
              if (isCorrectImage && imageElement.complete && imageElement.naturalHeight > 0) {
                console.log('✅ Correct image loaded!');
                resolve();
              } else if (attempts >= maxAttempts) {
                console.log('⚠️ Max attempts reached, proceeding anyway');
                resolve();
              } else {
                console.log('⏳ Image not ready yet, waiting...');
                setTimeout(checkImage, 200);
              }
            };
            
            // Force image reload
            imageElement.src = '';
            imageElement.onload = () => {
              console.log('🎉 Image onload triggered for:', imageElement.src);
              checkImage();
            };
            imageElement.onerror = () => {
              console.error('❌ Image failed to load');
              reject(new Error('Image failed to load'));
            };
            imageElement.src = nameplate.background;
            
            // Start checking immediately in case image loads synchronously
            setTimeout(checkImage, 100);
          });
          
          // Wait for the correct image to load
          await waitForCorrectImage;
          
          // 🔥 STEP 4: Additional wait to ensure DOM is fully updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('📸 About to capture image with background:', imageElement.src);
        }
        
        // 🔥 STEP 5: Capture the image
        const blob = await toBlob(previewRef.current, {
          backgroundColor: "white",
          quality: 0.95,
          pixelRatio: 2,
          skipFonts: false,
          useCORS: true,
          allowTaint: true,
          filter: (node) => {
            if (node instanceof HTMLImageElement) {
              console.log('🎯 Capturing image node:', node.src);
            }
            return true;
          }
        });

        if (!blob) {
          throw new Error('Failed to generate image blob');
        }

        console.log('✅ Image blob generated successfully');

        // 🔥 STEP 6: Upload to Supabase
        const fileName = `nameplate-${nameplate.officer_name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
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
        
        console.log('📤 Uploaded to:', urlData.publicUrl);
        
        // 🔥 STEP 7: Save to MongoDB
        const mongoResult = await saveToMongoDB(nameplate, urlData.publicUrl);
        
        results.push({
          nameplate: nameplate.officer_name,
          success: mongoResult.success,
          error: mongoResult.error,
          url: urlData.publicUrl
        });

      } catch (err: any) {
        console.error(`❌ Error processing ${nameplate.officer_name}:`, err);
        results.push({
          nameplate: nameplate.officer_name,
          success: false,
          error: err.message || 'Unknown error'
        });
      }
      
      // Small delay between nameplates
      if (i < nameplates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
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
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white text-black shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">🎨 Nameplate Designer</h2>

        {/* ... Error Display and Nameplate Management sections ... */}
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

        {/* ✅ DYNAMIC TEXT EDITING PANEL */}
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
              
              {/* Color Selection for Active Field */}
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

              {/* Font Size Selection for Active Field */}
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

        {/* ... Template Selection section ... */}
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

        {/* ✅ UPDATED DISPLAY INPUTS with onFocus */}
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
            />
          </div>
        </div>
        
        {/* ... Action Buttons and the rest of the component ... */}
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
      
      {/* Preview Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* ... Same preview and thumbnail grid as before ... */}
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
          />

          <div className="absolute inset-0  px-6 space-y-2">
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