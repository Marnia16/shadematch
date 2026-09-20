import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles, Copy, Check, Info, ArrowRight } from "lucide-react";
import { SEASONAL_PALETTES, UNDERTONE_GUIDE } from "../data/colorTheory";
import { copyToClipboard, getContrastTextColor } from "../utils/colorHelpers";

export default function Explore() {
  const [copiedHex, setCopiedHex] = useState(null);
  const [activeTab, setActiveTab] = useState("seasons"); // 'seasons' or 'undertones'

  const handleCopy = async (hex) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] text-[11px] font-semibold text-[#A8792A] uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          Color Theory & Seasonal Harmonies
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#121212]">
          Explore Color Palettes
        </h1>
        <p className="text-xs sm:text-sm text-[#7E6553] font-light max-w-xl mx-auto leading-relaxed">
          Master the four classical color seasons and undertone harmonies used by world-class stylists and couture designers.
        </p>

        {/* Tab switcher */}
        <div className="pt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("seasons")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "seasons"
                ? "bg-[#121212] text-white shadow-sm"
                : "bg-white border border-[#E8DFD5] text-[#7E6553] hover:text-[#121212]"
            }`}
          >
            The Four Seasons
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("undertones")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "undertones"
                ? "bg-[#121212] text-white shadow-sm"
                : "bg-white border border-[#E8DFD5] text-[#7E6553] hover:text-[#121212]"
            }`}
          >
            Undertone Diagnostics
          </button>
        </div>
      </div>

      {/* Seasons Tab Content */}
      {activeTab === "seasons" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SEASONAL_PALETTES.map((season) => (
            <div
              key={season.id}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E8DFD5] shadow-luxury flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8792A] block">
                  Season Category
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#121212]">
                  {season.season}
                </h3>
                <p className="text-xs text-[#7E6553] leading-relaxed">
                  {season.description}
                </p>

                {/* Swatches display */}
                <div className="pt-3 grid grid-cols-5 gap-2">
                  {season.swatches.map((swatch) => {
                    const textColor = getContrastTextColor(swatch.hex);
                    const isCopied = copiedHex === swatch.hex;

                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => handleCopy(swatch.hex)}
                        title={`Copy ${swatch.name} (${swatch.hex})`}
                        className="group relative h-20 rounded-xl overflow-hidden shadow-xs hover:scale-105 transition-all flex flex-col justify-between p-1.5 text-left"
                        style={{ backgroundColor: swatch.hex }}
                      >
                        <span
                          className="text-[9px] font-bold truncate block"
                          style={{ color: textColor }}
                        >
                          {swatch.name.split(" ")[0]}
                        </span>
                        <div className="flex items-center justify-between">
                          <span
                            className="font-mono text-[8px] font-semibold opacity-80"
                            style={{ color: textColor }}
                          >
                            {swatch.hex}
                          </span>
                          {isCopied ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy
                              className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: textColor }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Styling guidance badges */}
              <div className="pt-4 border-t border-[#F4EFEA] space-y-1.5 text-xs text-[#7E6553]">
                <p>
                  <strong className="text-[#121212]">Harmonizing Metals: </strong>
                  {season.bestMetals}
                </p>
                <p>
                  <strong className="text-[#121212]">Ideal Textures: </strong>
                  {season.powerFabric}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Undertones Tab Content */}
      {activeTab === "undertones" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {UNDERTONE_GUIDE.map((tone) => (
            <div
              key={tone.type}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8792A] block">
                  Chromatic Base
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#121212]">
                  {tone.type} Undertone
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[#7E6553] leading-relaxed">
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD5]">
                  <strong className="text-[#121212] block mb-1">Vein Appearance:</strong>
                  <p>{tone.veinColor}</p>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD5]">
                  <strong className="text-[#121212] block mb-1">Metal Reflection:</strong>
                  <p>{tone.jewelryPreference}</p>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFD5]">
                  <strong className="text-[#121212] block mb-1">Sun Response:</strong>
                  <p>{tone.sunReaction}</p>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                  <strong className="block mb-1 font-semibold">Hero Shades:</strong>
                  <p>{tone.keyCompliments}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#121212] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all transform hover:-translate-y-0.5"
        >
          <span>Test Your Photo Now</span>
          <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
        </Link>
      </div>
    </div>
  );
}
