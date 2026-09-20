import React from "react";
import { Coffee, Briefcase, GlassWater, Heart, Flame, Moon, Sparkles, Check } from "lucide-react";
import { OCCASIONS } from "../data/occasions";

const OCCASION_ICONS = {
  Coffee,
  Briefcase,
  GlassWater,
  Heart,
  Flame,
  Moon,
  Sparkles
};

export default function OccasionSelector({ selectedOccasion, onSelectOccasion }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-editorial text-xl font-bold text-[#121212]">
          What's the occasion?
        </h3>
        <p className="text-xs text-[#7E6553] mt-0.5">
          Occasion modulates color formality, richness, and festive luminosity.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {OCCASIONS.map((occ) => {
          const isSelected = selectedOccasion.toLowerCase() === occ.name.toLowerCase();
          const Icon = OCCASION_ICONS[occ.icon] || Sparkles;

          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => onSelectOccasion(occ.name)}
              className={`relative text-left p-3.5 rounded-xl transition-all duration-200 flex flex-col justify-between h-32 ${
                isSelected
                  ? "bg-[#121212] text-white shadow-luxury scale-[1.03] ring-2 ring-[#D4AF37]"
                  : "bg-white/80 border border-[#E8DFD5] hover:border-[#D5C4B4] text-[#121212] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-white/15 text-[#D4AF37]" : "bg-[#FAF8F5] text-[#7E6553]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37] text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <span className="font-editorial text-sm font-bold block leading-snug">
                  {occ.name}
                </span>
                <span
                  className={`text-[10px] block mt-0.5 font-medium ${
                    isSelected ? "text-stone-300" : "text-[#9E826D]"
                  }`}
                >
                  {occ.badge}
                </span>
              </div>

              <div
                className={`text-[9px] uppercase tracking-wider font-semibold ${
                  isSelected ? "text-[#D4AF37]" : "text-[#BAA28E]"
                }`}
              >
                {occ.formality} Formality
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
