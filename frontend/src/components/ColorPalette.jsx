import React, { useState } from "react";
import ColorCard from "./ColorCard";
import { Sparkles, Layers, ShieldAlert, Award } from "lucide-react";

export default function ColorPalette({
  paletteGroups,
  favorites = [],
  onFavoriteToggle,
  onSelectForOutfit,
  activeDressColor,
  onTryOn
}) {
  const [activeTab, setActiveTab] = useState("all");

  if (!paletteGroups) return null;

  const power = paletteGroups.primary_power || [];
  const neutrals = paletteGroups.harmonious_neutrals || [];
  const accents = paletteGroups.statement_accents || [];
  const caution = paletteGroups.approach_with_care || [];

  const tabs = [
    { id: "all", label: "Complete Palette", count: power.length + neutrals.length + accents.length },
    { id: "power", label: "Power Colors", count: power.length, icon: Award },
    { id: "neutrals", label: "Quiet Neutrals", count: neutrals.length, icon: Layers },
    { id: "accents", label: "Statement Accents", count: accents.length, icon: Sparkles },
    { id: "caution", label: "Style with Care", count: caution.length, icon: ShieldAlert },
  ];

  let displayColors = [];
  if (activeTab === "all") {
    displayColors = [...power, ...neutrals, ...accents];
  } else if (activeTab === "power") {
    displayColors = power;
  } else if (activeTab === "neutrals") {
    displayColors = neutrals;
  } else if (activeTab === "accents") {
    displayColors = accents;
  } else if (activeTab === "caution") {
    displayColors = caution;
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8DFD5] scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#121212] text-white shadow-md"
                  : "bg-white/80 text-[#7E6553] hover:text-[#121212] border border-[#E8DFD5] hover:bg-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-stone-100 text-[#7E6553]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Color Cards Grid */}
      {displayColors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayColors.map((color, idx) => {
            const isFav = favorites.some((f) => f.hex?.toLowerCase() === color.hex?.toLowerCase());
            const isSelectedInOutfit = activeDressColor?.toLowerCase() === color.hex?.toLowerCase();
            return (
              <ColorCard
                key={`${color.hex}_${idx}`}
                color={color}
                isFavorite={isFav}
                onFavoriteToggle={onFavoriteToggle}
                onSelectForOutfit={onSelectForOutfit}
                selectedForOutfit={isSelectedInOutfit}
                onTryOn={onTryOn}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFD5] text-[#7E6553] text-xs">
          No shades categorized under this filter.
        </div>
      )}

      {/* Caution advice banner when in caution tab */}
      {activeTab === "caution" && caution.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>Styling Insight:</strong> These shades can slightly wash out or blend too closely with your natural complexion. If you love them, balance them with contrasting scarves, bold necklaces, or darker outerwear.
        </div>
      )}
    </div>
  );
}
