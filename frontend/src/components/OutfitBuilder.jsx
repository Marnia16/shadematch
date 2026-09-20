import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, BookmarkCheck, Check, Share2, Copy, Palette } from "lucide-react";
import { saveLook } from "../services/firebase";
import { copyToClipboard, getContrastTextColor } from "../utils/colorHelpers";

const ACCESSORY_OPTIONS = [
  { name: "Polished Yellow Gold", hex: "#D4AF37" },
  { name: "Sterling Silver", hex: "#C0C0C0" },
  { name: "Warm Rose Gold", hex: "#B76E79" },
  { name: "Freshwater Pearl", hex: "#F0EAD6" },
  { name: "Antique Brass", hex: "#8B7355" }
];

const FOOTWEAR_OPTIONS = [
  { name: "Nude Blush", hex: "#DEBA9D" },
  { name: "Caramel Tan", hex: "#9E6843" },
  { name: "Midnight Noir", hex: "#1A1A1A" },
  { name: "Metallic Gilt", hex: "#C5A059" },
  { name: "Mirror Silver", hex: "#D3D3D3" },
  { name: "Burnished Oxblood", hex: "#4A121A" }
];

const BAG_OPTIONS = [
  { name: "Warm Sand", hex: "#C8B69E" },
  { name: "Cognac Leather", hex: "#8A4927" },
  { name: "Matte Obsidian", hex: "#1E1E1E" },
  { name: "Forest Green Suede", hex: "#154734" },
  { name: "Champagne Satin", hex: "#E2D3B8" },
  { name: "Burgundy Velvet", hex: "#681826" }
];

export default function OutfitBuilder({
  initialOutfit,
  skinTone,
  undertone,
  dressType,
  occasion,
  onSaved
}) {
  const [dressColor, setDressColor] = useState(
    initialOutfit?.dress || { item: dressType, name: "Emerald Green", hex: "#0D7A53" }
  );
  const [accessoryColor, setAccessoryColor] = useState(
    initialOutfit?.accessories || ACCESSORY_OPTIONS[0]
  );
  const [footwearColor, setFootwearColor] = useState(
    initialOutfit?.footwear || FOOTWEAR_OPTIONS[0]
  );
  const [bagColor, setBagColor] = useState(
    initialOutfit?.bag || BAG_OPTIONS[0]
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLook, setCopiedLook] = useState(false);

  const handleSaveCombination = async () => {
    setSaving(true);
    try {
      const lookData = {
        skinTone: skinTone || "Medium",
        undertone: undertone || "Warm",
        dressType: dressType || "Saree",
        occasion: occasion || "Wedding",
        heroColor: dressColor,
        outfit: {
          dress: dressColor,
          accessories: accessoryColor,
          footwear: footwearColor,
          bag: bagColor
        },
        notes: `Harmonized ensemble for ${occasion} ${dressType}.`
      };

      await saveLook(lookData);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#D4AF37", "#0D7A53", "#800020", "#FFFFFF"]
      });

      setSavedSuccess(true);
      if (onSaved) onSaved(lookData);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save look", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLookText = async () => {
    const text = `ShadeMatch Look Ensemble:
• Silhouette: ${dressType} (${occasion})
• Dress Color: ${dressColor.name} (${dressColor.hex})
• Accessories: ${accessoryColor.name} (${accessoryColor.hex})
• Footwear: ${footwearColor.name} (${footwearColor.hex})
• Bag / Clutch: ${bagColor.name} (${bagColor.hex})`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedLook(true);
      setTimeout(() => setCopiedLook(false), 2000);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] text-[11px] font-semibold text-[#A8792A] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Styling Studio
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#121212]">
            Build Your Look
          </h3>
          <p className="text-xs text-[#7E6553] mt-1">
            Coordinate your dress shade with tailored accessory, shoe, and clutch pairings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyLookText}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D5C4B4] bg-white text-xs font-semibold text-[#121212] hover:bg-stone-50 transition-all"
          >
            {copiedLook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLook ? "Copied!" : "Copy Summary"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCombination}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-luxury transition-all transform hover:-translate-y-0.5 ${
              savedSuccess
                ? "bg-emerald-700"
                : "bg-[#121212] hover:bg-[#2A2A2A]"
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved to My Looks!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{saving ? "Saving..." : "Save Combination"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Look Canvas & Coordinators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Look Board Preview (Left 5 cols) */}
        <div className="lg:col-span-5 bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD5] space-y-5">
          <div className="flex items-center justify-between text-xs text-[#7E6553]">
            <span className="font-medium tracking-wide uppercase text-[10px]">Harmonized Ensemble Preview</span>
            <span className="font-bold text-[#121212]">{dressType} • {occasion}</span>
          </div>

          {/* Layered Visual Display */}
          <div className="space-y-3">
            {/* 1. Dress Layer */}
            <div
              className="p-4 rounded-xl shadow-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: dressColor.hex,
                color: getContrastTextColor(dressColor.hex)
              }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                  Dress ({dressType})
                </span>
                <span className="font-editorial text-lg font-bold">{dressColor.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-black/20 backdrop-blur-sm">
                {dressColor.hex}
              </span>
            </div>

            {/* 2. Accessories Layer */}
            <div
              className="p-3.5 rounded-xl shadow-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: accessoryColor.hex,
                color: getContrastTextColor(accessoryColor.hex)
              }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                  Accessories & Jewelry
                </span>
                <span className="font-editorial text-base font-bold">{accessoryColor.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-black/20 backdrop-blur-sm">
                {accessoryColor.hex}
              </span>
            </div>

            {/* 3. Footwear Layer */}
            <div
              className="p-3.5 rounded-xl shadow-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: footwearColor.hex,
                color: getContrastTextColor(footwearColor.hex)
              }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                  Footwear
                </span>
                <span className="font-editorial text-base font-bold">{footwearColor.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-black/20 backdrop-blur-sm">
                {footwearColor.hex}
              </span>
            </div>

            {/* 4. Bag Layer */}
            <div
              className="p-3.5 rounded-xl shadow-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: bagColor.hex,
                color: getContrastTextColor(bagColor.hex)
              }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                  Bag / Clutch
                </span>
                <span className="font-editorial text-base font-bold">{bagColor.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-black/20 backdrop-blur-sm">
                {bagColor.hex}
              </span>
            </div>
          </div>
        </div>

        {/* Customization Selectors (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Accessories selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#121212] uppercase tracking-wider">
                Accessories & Metals
              </label>
              <span className="text-xs text-[#7E6553]">{accessoryColor.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ACCESSORY_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setAccessoryColor(opt)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    accessoryColor.name === opt.name
                      ? "bg-white border-2 border-[#D4AF37] shadow-sm font-bold"
                      : "bg-white/70 border border-[#E8DFD5] text-[#7E6553] hover:bg-white"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footwear selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#121212] uppercase tracking-wider">
                Footwear
              </label>
              <span className="text-xs text-[#7E6553]">{footwearColor.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FOOTWEAR_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setFootwearColor(opt)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    footwearColor.name === opt.name
                      ? "bg-white border-2 border-[#D4AF37] shadow-sm font-bold"
                      : "bg-white/70 border border-[#E8DFD5] text-[#7E6553] hover:bg-white"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bag selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#121212] uppercase tracking-wider">
                Bag / Clutch
              </label>
              <span className="text-xs text-[#7E6553]">{bagColor.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BAG_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setBagColor(opt)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    bagColor.name === opt.name
                      ? "bg-white border-2 border-[#D4AF37] shadow-sm font-bold"
                      : "bg-white/70 border border-[#E8DFD5] text-[#7E6553] hover:bg-white"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
