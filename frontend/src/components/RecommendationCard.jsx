import React from "react";
import { Sparkles, Info, ShieldCheck, SunMedium } from "lucide-react";

export default function RecommendationCard({
  skinTone,
  undertone,
  confidence,
  sampledHex,
  toneDescription,
  undertoneDescription,
  stylingAdvice,
  dressType,
  occasion,
  disclaimer
}) {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-6">
      {/* Top Banner: Estimated Skin Tone & Undertone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E8DFD5]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#A8792A]">
              Colorimetry Analysis
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-[11px] font-medium text-[#7E6553]">
              Confidence: {Math.round((confidence || 0.88) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Color Swatch Circle */}
            <div
              className="w-12 h-12 rounded-full border-2 border-white shadow-md flex-shrink-0"
              style={{ backgroundColor: sampledHex || "#D8A47F" }}
              title={`Sampled Complexion: ${sampledHex}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#121212]">
                  {skinTone || "Estimated"}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#D5C4B4] font-semibold text-[#121212]">
                  {undertone || "Neutral"} Undertone
                </span>
              </div>
              <p className="text-xs text-[#7E6553] mt-0.5">
                Estimated skin-tone range
              </p>
            </div>
          </div>
        </div>

        {/* Dress & Occasion Context Tag */}
        <div className="bg-[#FAF8F5] px-4 py-3 rounded-2xl border border-[#E8DFD5] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#D5C4B4] flex items-center justify-center text-[#A8792A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E826D] block">
              Styling Focus
            </span>
            <span className="text-xs font-bold text-[#121212]">
              {dressType} for {occasion}
            </span>
          </div>
        </div>
      </div>

      {/* Tone Description & Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#7E6553] leading-relaxed">
        <div className="bg-white/80 p-4 rounded-xl border border-[#E8DFD5] space-y-1">
          <strong className="text-[#121212] block text-xs">Complexion Harmony:</strong>
          <p>{toneDescription}</p>
        </div>
        <div className="bg-white/80 p-4 rounded-xl border border-[#E8DFD5] space-y-1">
          <strong className="text-[#121212] block text-xs">Undertone Characteristic:</strong>
          <p>{undertoneDescription}</p>
        </div>
      </div>

      {/* Styling Advice Section */}
      {stylingAdvice && (
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8DFD5] space-y-3">
          <h4 className="text-xs font-bold text-[#121212] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Editorial Style Direction
          </h4>
          <div className="space-y-2 text-xs text-[#7E6553]">
            <p>
              <strong className="text-[#121212]">Why these colors: </strong>
              {stylingAdvice.harmony_rationale}
            </p>
            <p>
              <strong className="text-[#121212]">Fabric Selection: </strong>
              {stylingAdvice.fabric_recommendation}
            </p>
            <p>
              <strong className="text-[#121212]">Finishing Touches: </strong>
              {stylingAdvice.styling_tip}
            </p>
          </div>
        </div>
      )}

      {/* Respectful Disclaimer */}
      <div className="flex items-start gap-2.5 pt-2 text-[11px] text-[#9E826D] border-t border-[#F4EFEA]">
        <Info className="w-3.5 h-3.5 shrink-0 text-[#BAA28E] mt-0.5" />
        <p className="leading-normal">
          {disclaimer || "These colors are suggested as complementary styling options based on digital image analysis. Personal confidence and individual expression always take precedence."}
        </p>
      </div>
    </div>
  );
}
