import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Copy, Check, Sparkles, Plus, Filter, Calendar } from "lucide-react";
import { getSavedLooks, deleteSavedLook } from "../services/firebase";
import { copyToClipboard, getContrastTextColor } from "../utils/colorHelpers";

export default function Favorites() {
  const [looks, setLooks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setLooks(getSavedLooks());
  }, []);

  const handleDelete = (id) => {
    const updated = deleteSavedLook(id);
    setLooks(updated);
  };

  const handleCopyLook = async (look) => {
    const text = `ShadeMatch Saved Look:
• Silhouette: ${look.dressType} (${look.occasion})
• Main Color: ${look.heroColor?.name || "N/A"} (${look.heroColor?.hex || ""})
• Accessories: ${look.outfit?.accessories?.name || "Gold"}
• Footwear: ${look.outfit?.footwear?.name || "Nude"}
• Bag: ${look.outfit?.bag?.name || "Sand"}
• Date Saved: ${look.date}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(look.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredLooks = looks.filter((look) => {
    if (selectedFilter === "all") return true;
    return (
      look.dressType?.toLowerCase() === selectedFilter.toLowerCase() ||
      look.occasion?.toLowerCase() === selectedFilter.toLowerCase()
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] text-[11px] font-semibold text-[#A8792A] uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            Personalized Collection
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#121212]">
            My Looks & Palettes
          </h1>
          <p className="text-xs sm:text-sm text-[#7E6553] mt-0.5 font-light">
            Your saved ensemble coordinates, curated jewel tones, and sartorial pairings.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#121212] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Create New Look</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      {looks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["all", "Saree", "Gown", "Shirt", "Wedding", "Office", "Party"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedFilter === filter
                  ? "bg-[#121212] text-white shadow-sm"
                  : "bg-white border border-[#E8DFD5] text-[#7E6553] hover:text-[#121212]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Looks Grid */}
      {filteredLooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLooks.map((look) => {
            const hero = look.heroColor || { name: "Emerald Green", hex: "#0D7A53" };
            const textColor = getContrastTextColor(hero.hex);

            return (
              <div
                key={look.id}
                className="bg-white rounded-3xl border border-[#E8DFD5] shadow-luxury hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Swatch Header */}
                <div
                  className="h-36 p-4 flex flex-col justify-between relative"
                  style={{ backgroundColor: hero.hex }}
                >
                  <div className="flex items-center justify-between z-10">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{
                        backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
                        color: textColor
                      }}
                    >
                      {look.dressType} • {look.occasion}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(look.id)}
                      title="Remove from saved looks"
                      className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md opacity-80 hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                      style={{
                        backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
                        color: textColor
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="z-10">
                    <h3
                      className="font-editorial text-xl font-bold leading-tight"
                      style={{ color: textColor }}
                    >
                      {hero.name}
                    </h3>
                    <span
                      className="font-mono text-[11px] opacity-90 font-semibold"
                      style={{ color: textColor }}
                    >
                      {hero.hex}
                    </span>
                  </div>
                </div>

                {/* Ensemble Coordinates Body */}
                <div className="p-5 space-y-4 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5]">
                        <span className="text-[9px] uppercase font-bold text-[#9E826D] block">
                          Accessory
                        </span>
                        <div
                          className="w-4 h-4 rounded-full mx-auto my-1 border border-black/10"
                          style={{ backgroundColor: look.outfit?.accessories?.hex || "#D4AF37" }}
                        />
                        <span className="text-[10px] font-semibold text-[#121212] truncate block">
                          {look.outfit?.accessories?.name?.split(" ")[0] || "Gold"}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5]">
                        <span className="text-[9px] uppercase font-bold text-[#9E826D] block">
                          Shoes
                        </span>
                        <div
                          className="w-4 h-4 rounded-full mx-auto my-1 border border-black/10"
                          style={{ backgroundColor: look.outfit?.footwear?.hex || "#DEBA9D" }}
                        />
                        <span className="text-[10px] font-semibold text-[#121212] truncate block">
                          {look.outfit?.footwear?.name?.split(" ")[0] || "Nude"}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5]">
                        <span className="text-[9px] uppercase font-bold text-[#9E826D] block">
                          Clutch / Bag
                        </span>
                        <div
                          className="w-4 h-4 rounded-full mx-auto my-1 border border-black/10"
                          style={{ backgroundColor: look.outfit?.bag?.hex || "#C8B69E" }}
                        />
                        <span className="text-[10px] font-semibold text-[#121212] truncate block">
                          {look.outfit?.bag?.name?.split(" ")[0] || "Beige"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#7E6553] italic">
                      "{look.notes || "Tailored harmonized palette."}"
                    </p>
                  </div>

                  {/* Card Footer: Date & Copy */}
                  <div className="pt-3 border-t border-[#F4EFEA] flex items-center justify-between text-xs text-[#9E826D]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {look.date}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyLook(look)}
                      className="flex items-center gap-1 font-semibold text-[#A8792A] hover:text-[#121212]"
                    >
                      {copiedId === look.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Look</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD5] space-y-4 max-w-xl mx-auto p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center mx-auto text-[#D4AF37]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#121212]">
            No Saved Looks Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#7E6553] max-w-sm mx-auto leading-relaxed">
            Run an analysis in our color studio and click "Save Combination" or bookmark individual swatches to assemble your dream wardrobe.
          </p>
          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#121212] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all"
            >
              Start Analysis Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
