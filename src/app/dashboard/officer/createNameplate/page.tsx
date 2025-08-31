"use client";

import { useState, useEffect, useRef } from "react";

// Logos
const logos = {
  ambuja: "/logos/ambuja.png",
  acc: "/logos/acc.png",
};

// Backgrounds
const backgrounds: Record<string, string[]> = {
  ambuja: ["/backgrounds/ambuja/d2.webp", "/backgrounds/ambuja/d3.webp", "/backgrounds/ambuja/d4.webp", "/backgrounds/ambuja/d1.webp"],
  acc: ["/backgrounds/acc/d1.webp", "/backgrounds/acc/d2.webp", "/backgrounds/acc/d3.webp", "/backgrounds/acc/d4.webp"],
};

// Language Fonts
const languageFonts: Record<string, string[]> = {
  English: ["Roboto", "Open Sans", "Merriweather"],
  Hindi: ["Noto Sans Devanagari", "Noto Serif Devanagari", "Tiro Devanagari"],
  Gujarati: ["Noto Sans Gujarati", "Shruti"],
  Urdu: ["Noto Nastaliq Urdu", "Noto Sans Arabic"],
};

// Default styles
const defaultStyles = {
  houseName: { fontSize: 32, color: "#ffffff", x: 200, y: 100 },
  ownerName: { fontSize: 24, color: "#ffffff", x: 200, y: 180 },
  address: { fontSize: 18, color: "#ffffff", x: 200, y: 240 },
};

// Default nameplate
const defaultNameplateData = {
  logo: "ambuja" as "ambuja" | "acc",
  background: backgrounds.ambuja[0],
  language: "English",
  font: languageFonts.English[0],
  houseName: "My Sweet Home",
  ownerName: "Aditya Dhawle",
  address: "Plot No. 21, Pune, India",
  styles: { ...defaultStyles },
};

type Nameplate = typeof defaultNameplateData & { id: string; officerName: string; email: string };

// Draggable Text Component
function DraggableText({ children, style, x, y, onDrag }: { children: React.ReactNode; style: React.CSSProperties; x: number; y: number; onDrag: (pos: { x: number; y: number }) => void }) {
  const dragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    onDrag({ x: x + e.movementX, y: y + e.movementY });
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <div style={{ position: "absolute", left: x, top: y, cursor: "move", ...style }}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {children}
    </div>
  );
}

export default function NameplateDesigner() {
  const [nameplates, setNameplates] = useState<Nameplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser({ name: data.user.name, email: data.user.email });
          setNameplates([{
            id: crypto.randomUUID(),
            ...defaultNameplateData,
            officerName: data.user.name,
            email: data.user.email,
          }]);
        }
      });
  }, []);

  if (!user) return <div>Loading...</div>;

  const current = nameplates[currentIndex];

  const updateCurrent = (updates: Partial<Nameplate>) => {
    setNameplates(prev => prev.map((np, i) => i === currentIndex ? { ...np, ...updates } : np));
  };

  const addNameplate = () => {
    const newPlate: Nameplate = {
      id: crypto.randomUUID(),
      ...defaultNameplateData,
      officerName: user.name,
      email: user.email,
    };
    setNameplates(prev => [...prev, newPlate]);
    setCurrentIndex(nameplates.length);
  };

  const deleteNameplate = () => {
    if (nameplates.length <= 1) return;
    const newList = nameplates.filter((_, i) => i !== currentIndex);
    setNameplates(newList);
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleSubmitAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/nameplate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nameplates),
      });
      const data = await res.json();
      if (data.success) alert("All nameplates saved successfully!");
      else alert("Error: " + data.error);
    } catch (error) {
      alert("Error: " + (error as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">🎨 Nameplate Designer</h2>

        {/* Navigation */}
        <div className="flex gap-2 mb-2">
          {nameplates.map((_, i) => (
            <button key={i} className={`px-2 py-1 rounded ${i === currentIndex ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentIndex(i)}>{i + 1}</button>
          ))}
          <button onClick={addNameplate} className="px-2 py-1 bg-green-500 text-white rounded">+ Add</button>
          <button onClick={deleteNameplate} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
        </div>

        {/* Logo Selection */}
        <p className="font-semibold">Logo</p>
        <div className="flex gap-3 mb-2">
          {Object.entries(logos).map(([key, src]) => (
            <button key={key} onClick={() => updateCurrent({ logo: key as "ambuja" | "acc", background: backgrounds[key as "ambuja" | "acc"][0] })}>
              <img src={src} alt={key} className={`w-16 h-16 border rounded ${current.logo === key ? "border-indigo-500" : "border-gray-300"}`} />
            </button>
          ))}
        </div>

        {/* Background Selection */}
        <p className="font-semibold">Background</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {backgrounds[current.logo].map(bg => (
            <button key={bg} onClick={() => updateCurrent({ background: bg })}>
              <img src={bg} alt="bg" className={`w-24 h-16 object-cover rounded ${current.background === bg ? "ring-2 ring-indigo-500" : ""}`} />
            </button>
          ))}
        </div>

        {/* Language & Font */}
        <p className="font-semibold">Language</p>
        <select className="w-full border rounded p-2 mb-2" value={current.language} onChange={e => updateCurrent({ language: e.target.value, font: languageFonts[e.target.value][0] })}>
          {Object.keys(languageFonts).map(lang => <option key={lang}>{lang}</option>)}
        </select>
        <p className="font-semibold">Font</p>
        <select className="w-full border rounded p-2 mb-2" value={current.font} onChange={e => updateCurrent({ font: e.target.value })}>
          {languageFonts[current.language].map(f => <option key={f}>{f}</option>)}
        </select>

        {/* Text Inputs */}
        <input type="text" placeholder="House Name" value={current.houseName} onChange={e => updateCurrent({ houseName: e.target.value })} className="w-full border rounded p-2 mb-2" disabled={previewMode} />
        <input type="text" placeholder="Owner Name" value={current.ownerName} onChange={e => updateCurrent({ ownerName: e.target.value })} className="w-full border rounded p-2 mb-2" disabled={previewMode} />
        <textarea placeholder="Address" value={current.address} onChange={e => updateCurrent({ address: e.target.value })} className="w-full border rounded p-2 mb-2" disabled={previewMode} />

        {/* Preview & Submit */}
        <div className="flex gap-4">
          <button onClick={() => setPreviewMode(!previewMode)} className="flex-1 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700">{previewMode ? "Edit Mode" : "Preview"}</button>
          <button onClick={handleSubmitAll} className="flex-1 bg-green-600 text-white rounded p-2 hover:bg-green-700" disabled={saving}>{saving ? "Saving..." : "Submit All"}</button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div id="preview" className="relative w-[600px] h-[400px] rounded-xl shadow-2xl overflow-hidden" style={{ backgroundImage: `url(${current.background})`, backgroundSize: "cover", fontFamily: current.font }}>
          <img src={logos[current.logo]} alt="logo" className="absolute top-4 left-4 w-20" />

          <DraggableText x={current.styles.houseName.x} y={current.styles.houseName.y} style={{ fontSize: current.styles.houseName.fontSize, color: current.styles.houseName.color }} onDrag={pos => updateCurrent({ styles: { ...current.styles, houseName: { ...current.styles.houseName, ...pos } } })}>
            <h1>{current.houseName}</h1>
          </DraggableText>

          <DraggableText x={current.styles.ownerName.x} y={current.styles.ownerName.y} style={{ fontSize: current.styles.ownerName.fontSize, color: current.styles.ownerName.color }} onDrag={pos => updateCurrent({ styles: { ...current.styles, ownerName: { ...current.styles.ownerName, ...pos } } })}>
            <p>{current.ownerName}</p>
          </DraggableText>

          <DraggableText x={current.styles.address.x} y={current.styles.address.y} style={{ fontSize: current.styles.address.fontSize, color: current.styles.address.color }} onDrag={pos => updateCurrent({ styles: { ...current.styles, address: { ...current.styles.address, ...pos } } })}>
            <p>{current.address}</p>
          </DraggableText>
        </div>
      </div>
    </div>
  );
}
