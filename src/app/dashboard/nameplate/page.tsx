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

type Nameplate = {
  _id?: string;
  logo: "ambuja" | "acc";
  background: string;
  language: string;
  font: string;
  houseName: string;
  ownerName: string;
  address: string;
  styles: typeof defaultStyles;
  officerName: string;
  email: string;
};

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

export default function NameplateViewer() {
  const [nameplates, setNameplates] = useState<Nameplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all saved nameplates
  useEffect(() => {
    fetch("/api/name-plate")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNameplates(data.nameplates);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (nameplates.length === 0) return <div className="p-10 text-center">No nameplates found.</div>;

  const current = nameplates[currentIndex];

  const updateCurrent = (updates: Partial<Nameplate>) => {
    setNameplates(prev => prev.map((np, i) => i === currentIndex ? { ...np, ...updates } : np));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white shadow-lg p-6 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">📋 Your Saved Nameplates</h2>

        {/* Navigation */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {nameplates.map((np, i) => (
            <button key={np._id || i} className={`px-2 py-1 rounded ${i === currentIndex ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentIndex(i)}>
              {i + 1}
            </button>
          ))}
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

        {/* Backgrounds */}
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
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-[600px] h-[400px] rounded-xl shadow-2xl overflow-hidden" style={{ backgroundImage: `url(${current.background})`, backgroundSize: "cover", fontFamily: current.font }}>
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
