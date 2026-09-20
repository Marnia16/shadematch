import React, { useState } from "react";
import { Copy, Check, Heart, Maximize2, Sparkles } from "lucide-react";
import { copyToClipboard, getContrastTextColor } from "../utils/colorHelpers";

export default function ColorCard({
  color,
  onFavoriteToggle,
  isFavorite = false,
  onSelectForOutfit,
  selectedForOutfit = false
}) {
  const [copied, setCopied] = useState(false);
  const [showEnlarged, setShowEnlarged] = useState(false);

  const hex = color.hex || "#121212";
  const name = color.name || "Custom Color";
  const mood = color.mood || "Complementary Tone";
  const textColor = getContrastTextColor(hex);

  const handleCopy = async (e) => {
    e.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleHeart = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(color);
    }
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-2xl border border-[#E8DFD5] hover:border-[#D5C4B4] shadow-sm hover:shadow-luxury transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
        onClick={() => onSelectForOutfit && onSelectForOutfit(color)}
      >
        {/* Color Swatch Header */}
        <div
          className="relative h-40 w-full transition-transform duration-500 group-hover:scale-[1.03] flex flex-col justify-between p-3.5"
          style={{ backgroundColor: hex }}
        >
          {/* Top action buttons overlay */}
          <div className="flex items-center justify-between z-10">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md"
              style={{
                backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
                color: textColor
              }}
            >
              {color.family || "Curated"}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnlarged(true);
                }}
                title="Preview full screen"
                className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md opacity-80 hover:opacity-100 transition-all hover:scale-110"
                style={{
                  backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
                  color: textColor
                }}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleHeart}
                title={isFavorite ? "Remove from favorites" : "Save to favorites"}
                className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md opacity-80 hover:opacity-100 transition-all hover:scale-110"
                style={{
                  backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
                  color: textColor
                }}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Bottom sheen badge on swatch */}
          <div className="z-10 flex items-center justify-between">
            <span
              className="text-xs font-mono font-semibold tracking-wider px-2 py-0.5 rounded backdrop-blur-sm shadow-sm"
              style={{
                backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)",
                color: textColor
              }}
            >
              {hex}
            </span>

            {selectedForOutfit && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-black px-2 py-0.5 rounded-full shadow-sm">
                Active in Look
              </span>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
          <div>
            <h4 className="font-editorial text-lg font-bold text-[#121212] group-hover:text-[#A8792A] transition-colors leading-tight">
              {name}
            </h4>
            <p className="text-xs text-[#7E6553] mt-1 line-clamp-1">{mood}</p>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-[#F4EFEA] flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                copied
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-[#FAF8F5] text-[#7E6553] hover:text-[#121212] border-[#E8DFD5] hover:bg-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#9E826D]" />
                  <span>Copy HEX</span>
                </>
              )}
            </button>

            {onSelectForOutfit && (
              <button
                type="button"
                onClick={() => onSelectForOutfit(color)}
                className="text-xs font-semibold text-[#A8792A] hover:text-[#121212] underline underline-offset-2"
              >
                Try in Look →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enlarged Color Preview Modal */}
      {showEnlarged && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowEnlarged(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full h-64 rounded-2xl shadow-inner flex flex-col items-center justify-center relative p-6"
              style={{ backgroundColor: hex }}
            >
              <h3
                className="font-editorial text-3xl font-bold text-center tracking-wide"
                style={{ color: textColor }}
              >
                {name}
              </h3>
              <p
                className="font-mono text-base font-semibold mt-2 px-3 py-1 rounded-md backdrop-blur-sm"
                style={{
                  backgroundColor: textColor === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
                  color: textColor
                }}
              >
                {hex}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#7E6553]">
                <span>Tonal Atmosphere: <strong className="text-[#121212]">{mood}</strong></span>
                <span>Category: <strong className="text-[#121212]">{color.family || "Hero Tone"}</strong></span>
              </div>
              <p className="text-xs text-[#7E6553] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD5]">
                This color is scientifically calibrated to create harmonious contrast against your skin tone's estimated chroma and value coordinates.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-[#FAF8F5] border border-[#D5C4B4] text-[#121212] flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied to Clipboard" : "Copy HEX"}
              </button>
              <button
                type="button"
                onClick={() => setShowEnlarged(false)}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-[#121212] text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
