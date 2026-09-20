import React from "react";
import { Sparkles, Shirt, Briefcase, Smile, Crown, Gem, Coffee, Award, Check } from "lucide-react";
import { DRESS_TYPES } from "../data/dressTypes";

const ICON_MAP = {
  Sparkles,
  Shirt,
  Briefcase,
  Smile,
  Crown,
  Gem,
  Coffee,
  Award
};

export default function DressSelector({ selectedDress, onSelectDress }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-editorial text-xl font-bold text-[#121212]">
            What are you planning to wear?
          </h3>
          <p className="text-xs text-[#7E6553] mt-0.5">
            Select your outfit silhouette to tailor fabric contrast and color balance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {DRESS_TYPES.map((dress) => {
          const isSelected = selectedDress.toLowerCase() === dress.name.toLowerCase();
          const Icon = ICON_MAP[dress.icon] || Sparkles;

          return (
            <button
              key={dress.id}
              type="button"
              onClick={() => onSelectDress(dress.name)}
              className={`relative text-left p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between h-36 ${
                isSelected
                  ? "bg-white border-2 border-[#D4AF37] shadow-luxury ring-1 ring-[#D4AF37]/30 scale-[1.02]"
                  : "bg-white/70 border border-[#E8DFD5] hover:border-[#D5C4B4] hover:bg-white"
              }`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF8F5] border border-[#E8DFD5] text-[#121212] mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? "text-[#D4AF37]" : "text-[#7E6553]"}`} />
              </div>

              <div>
                <span className="font-editorial text-base font-bold text-[#121212] block leading-tight">
                  {dress.name}
                </span>
                <span className="text-[11px] text-[#7E6553] line-clamp-1 mt-0.5">
                  {dress.tagline}
                </span>
              </div>

              <div className="text-[9px] text-[#9E826D] uppercase tracking-wider font-semibold">
                {dress.recommendedFabrics.split(",")[0]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
