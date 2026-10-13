import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  RefreshCw,
  BookmarkCheck,
  Check,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Palette,
  Camera,
  Shirt,
  Info,
  Cpu
} from "lucide-react";
import confetti from "canvas-confetti";
import { executeVirtualTryOn } from "../services/api";
import { saveLook } from "../services/firebase";
import { getContrastTextColor } from "../utils/colorHelpers";

const LOADING_STAGES = [
  { text: "Preparing images...", detail: "Validating portrait and garment reference photography" },
  { text: "Running AI Virtual Try-On...", detail: "Executing open-source latent diffusion virtual try-on" },
  { text: "AI Virtual Try-On complete.", detail: "Finalizing fabric drape synthesis and details" }
];

export default function TryOnModal({
  isOpen,
  onClose,
  color,
  dressType,
  occasion,
  imageFile,
  imageBase64,
  imagePreviewUrl,
  recommendedColors = [],
  onSelectAnotherColor
}) {
  // 'generating' | 'success' | 'model_unavailable' | 'garment_unavailable' | 'error'
  const [status, setStatus] = useState("generating");
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [resultImage, setResultImage] = useState(null);
  const [providerName, setProviderName] = useState("OOTDiffusion");
  const [errorMessage, setErrorMessage] = useState("");
  const [availableGarments, setAvailableGarments] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active garment requested
  const [activeColor, setActiveColor] = useState(color);
  const [activeDressType, setActiveDressType] = useState(dressType);

  useEffect(() => {
    setActiveColor(color);
    setActiveDressType(dressType);
  }, [color, dressType]);

  useEffect(() => {
    if (isOpen && activeColor) {
      generateLook();
    } else {
      // Reset state on close
      setStatus("generating");
      setLoadingStageIdx(0);
      setResultImage(null);
      setErrorMessage("");
      setSavedSuccess(false);
    }
  }, [isOpen, activeColor?.hex, activeDressType]);

  // Stage progression timer during loading
  useEffect(() => {
    if (status !== "generating") return;

    const interval = setInterval(() => {
      setLoadingStageIdx((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [status]);

  const generateLook = async (targetDress = activeDressType, targetColor = activeColor) => {
    setStatus("generating");
    setLoadingStageIdx(0);
    setErrorMessage("");
    setSavedSuccess(false);

    try {
      const response = await executeVirtualTryOn({
        imageFile,
        imageBase64,
        colorName: targetColor?.name,
        colorHex: targetColor?.hex,
        dressType: targetDress || "Casual Wear",
        occasion: occasion || "Casual"
      });

      if (response.success && response.image_url) {
        setResultImage(response.image_url);
        setProviderName(response.provider || "OOTDiffusion");
        setStatus("success");
      } else if (response.error === "VTON_MODEL_UNAVAILABLE" || response.code === "VTON_MODEL_UNAVAILABLE" || response.available === false) {
        setStatus("model_unavailable");
        setErrorMessage(
          response.message ||
          "AI Virtual Try-On is unavailable in this environment. Open-source diffusion VTON requires a compatible GPU environment."
        );
      } else if (response.error === "GARMENT_ASSET_UNAVAILABLE" || response.code === "GARMENT_ASSET_UNAVAILABLE") {
        setStatus("garment_unavailable");
        setErrorMessage(
          response.message ||
          "Virtual try-on isn't available for this outfit yet. We only generate try-ons with real garment photography to ensure quality."
        );
        if (response.available_garments) {
          setAvailableGarments(response.available_garments);
        }
      } else {
        setStatus("error");
        setErrorMessage(
          response.message ||
          "We could not generate your look right now. Please try again."
        );
      }
    } catch (err) {
      console.error("Virtual Try-On generation error:", err);
      setStatus("error");
      setErrorMessage("Could not connect to the try-on service. Please check your network or try again.");
    }
  };

  const handleSelectAlternativeOutfit = (g) => {
    setActiveDressType(g.dress_type);
    setActiveColor({ name: g.color_name, hex: g.color_hex });
  };

  const handleSaveToFavorites = async () => {
    if (!activeColor) return;
    setSaving(true);
    try {
      await saveLook({
        dressType: activeDressType || "Saree",
        occasion: occasion || "Wedding",
        heroColor: activeColor,
        palette: [activeColor],
        notes: `AI Virtual Try-On look in ${activeColor.name} ${activeDressType} rendered via OOTDiffusion.`
      });

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.warn("Failed to save try-on look", e);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !activeColor) return null;

  const hex = activeColor.hex || "#121212";
  const name = activeColor.name || "Selected Color";
  const textColor = getContrastTextColor(hex);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white rounded-3xl border border-[#E8DFD5] shadow-2xl overflow-hidden my-auto"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-[#D4AF37] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#121212]">
                  AI Virtual Dress Try-On
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8B6E16]">
                  Open-Source AI
                </span>
              </div>
              <p className="text-xs text-[#7E6553] mt-0.5">
                {name} • {activeDressType} for {occasion}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E8DFD5] text-[#7E6553] hover:text-[#121212] hover:bg-stone-50 flex items-center justify-center transition-all"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photography Guidance Banner */}
        <div className="bg-[#FFFDF9] border-b border-[#E8DFD5]/70 px-5 py-2.5 flex items-center gap-2.5 text-xs text-[#7E6553]">
          <Camera className="w-4 h-4 text-[#A8792A] shrink-0" />
          <span>
            <strong>Pro Tip:</strong> For optimal realistic draping, use a clear three-quarter or full-body portrait with visible torso and shoulders.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* STATE 1: GENERATING */}
          {status === "generating" && (
            <div className="py-10 sm:py-14 text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                {/* Glowing ring */}
                <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />

                {/* Portrait preview with laser scan HUD */}
                <div className="absolute inset-2.5 rounded-full overflow-hidden border border-[#E8DFD5] bg-[#FAF8F5] flex items-center justify-center">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="User Portrait"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: hex }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {/* Laser scan line */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-[#D4AF37] shadow-[0_0_12px_#D4AF37]"
                    animate={{ top: ["5%", "90%", "5%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-editorial text-xl font-bold text-[#121212]">
                  {LOADING_STAGES[loadingStageIdx].text}
                </h4>
                <p className="text-xs text-[#7E6553] leading-relaxed">
                  {LOADING_STAGES[loadingStageIdx].detail}
                </p>
              </div>

              {/* Progress Stepper Dots */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {LOADING_STAGES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === loadingStageIdx
                        ? "w-8 bg-[#D4AF37]"
                        : i < loadingStageIdx
                        ? "w-3 bg-[#121212]"
                        : "w-3 bg-[#E8DFD5]"
                    }`}
                  />
                ))}
              </div>

              {/* Color Target Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] text-xs font-medium text-[#121212]">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: hex }}
                />
                <span>Fitting: {name} ({hex}) • {activeDressType}</span>
              </div>
            </div>
          )}

          {/* STATE 2: SUCCESS */}
          {status === "success" && resultImage && (
            <div className="space-y-6">
              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Original User Image */}
                <div className="relative rounded-2xl overflow-hidden border border-[#E8DFD5] bg-[#FAF8F5] aspect-[3/4] flex flex-col justify-end">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Original Portrait"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-[#7E6553]">
                      No original image
                    </div>
                  )}
                  <div className="relative z-10 m-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[10px] uppercase font-bold tracking-wider text-white w-max">
                    Original Portrait
                  </div>
                </div>

                {/* 2. AI Generated Look */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-[#121212] aspect-[3/4] flex flex-col justify-end shadow-lg">
                  <img
                    src={resultImage}
                    alt="AI Virtual Try-On Result"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="relative z-10 m-3 flex items-center justify-between gap-2">
                    <div className="px-3 py-1 rounded-full bg-[#121212]/80 backdrop-blur-sm text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1.5 shadow">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>{providerName}</span>
                    </div>

                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold shadow border border-white/20"
                      style={{ backgroundColor: hex, color: textColor }}
                    >
                      {hex}
                    </div>
                  </div>
                </div>
              </div>

              {/* Garment Details & Rationale */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8792A] block">
                    Tailored Ensemble
                  </span>
                  <span className="font-editorial text-base sm:text-lg font-bold text-[#121212]">
                    {activeDressType} in {name}
                  </span>
                  <p className="text-xs text-[#7E6553] mt-0.5">
                    Curated for {occasion} • Powered by {providerName} Open-Source Neural Model
                  </p>
                </div>

                <div
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: hex }}
                  title={name}
                >
                  <Sparkles className="w-5 h-5" style={{ color: textColor }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#D5C4B4] text-xs font-semibold text-[#7E6553] hover:text-[#121212] hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Recommendations</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onSelectAnotherColor && recommendedColors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectAnotherColor();
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#D5C4B4] text-xs font-semibold text-[#121212] hover:bg-stone-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#7E6553]" />
                      <span>Try Another Color</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveToFavorites}
                    disabled={saving}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-luxury transition-all flex items-center justify-center gap-2 ${
                      savedSuccess
                        ? "bg-emerald-700"
                        : "bg-[#121212] hover:bg-[#2A2A2A]"
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Saved to My Looks!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Save Look</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: MODEL UNAVAILABLE IN CURRENT ENVIRONMENT */}
          {status === "model_unavailable" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                <Cpu className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  GPU Environment Required
                </span>
                <h4 className="font-editorial text-2xl font-bold text-[#121212] pt-1">
                  AI Virtual Try-On is unavailable in this environment.
                </h4>
                <p className="text-xs text-[#7E6553] leading-relaxed">
                  ShadeMatch uses the open-source <strong>OOTDiffusion</strong> model, which requires an NVIDIA CUDA GPU on Linux.
                  Apple Silicon Macs do not support CUDA, so local inference is unavailable.
                </p>
              </div>

              {/* Instructions box */}
              <div className="bg-[#FAF8F5] border border-[#E8DFD5] rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 text-[#7E6553]">
                <div className="flex items-center gap-2 font-semibold text-[#121212]">
                  <Info className="w-4 h-4 text-[#D4AF37]" />
                  <span>How to run real VTON for free:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  You can run OOTDiffusion completely free using a <strong>Google Colab T4 GPU</strong> notebook.
                  Follow the step-by-step guide in <code>docs/VTON_SETUP.md</code> to start the free worker and connect it via <code>OOTD_WORKER_URL</code>.
                </p>
                <div className="text-[10px] text-[#A8988B] pt-1 border-t border-[#E8DFD5]">
                  All other features (skin tone analysis, color recommendations, outfit builder) remain 100% functional.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#121212] text-xs font-semibold text-white shadow-luxury hover:bg-[#2A2A2A]"
                >
                  Close & Explore Recommendations
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: GARMENT ASSET UNAVAILABLE */}
          {status === "garment_unavailable" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-[#7E6553] flex items-center justify-center mx-auto border border-[#E8DFD5] shadow-sm">
                <Shirt className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-stone-200 text-stone-700">
                  Real Photography Required
                </span>
                <h4 className="font-editorial text-2xl font-bold text-[#121212] pt-1">
                  Virtual try-on isn't available for this outfit yet.
                </h4>
                <p className="text-xs text-[#7E6553] leading-relaxed">
                  We only generate try-ons with real garment photography to ensure quality.
                  Select one of the curated outfits currently in the catalog below:
                </p>
              </div>

              {/* Available Garments Recommendation Chips */}
              <div className="max-w-md mx-auto text-left space-y-2">
                <span className="text-[11px] font-bold text-[#121212] block">
                  Available Outfits in Real Photography Catalog:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(availableGarments.length > 0 ? availableGarments : [
                    { dress_type: "Saree", color_name: "Emerald Green", color_hex: "#0D7A53", title: "Emerald Green Saree" },
                    { dress_type: "Saree", color_name: "Maroon", color_hex: "#800020", title: "Maroon Banquet Saree" },
                    { dress_type: "Gown", color_name: "Emerald Green", color_hex: "#0D7A53", title: "Emerald Green Evening Dress" },
                    { dress_type: "Shirt", color_name: "Emerald Green", color_hex: "#0D7A53", title: "Emerald Green Button Shirt" },
                    { dress_type: "Shirt", color_name: "Navy Blue", color_hex: "#12263F", title: "Classic Navy Blue Shirt" },
                    { dress_type: "Kurti", color_name: "Emerald Green", color_hex: "#0D7A53", title: "Emerald Green Kurti" }
                  ]).map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAlternativeOutfit(item)}
                      className="p-2.5 rounded-xl border border-[#E8DFD5] bg-[#FAF8F5] hover:bg-stone-100 flex items-center gap-2.5 text-left transition-all group"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: item.color_hex }}
                      />
                      <div className="truncate">
                        <span className="text-xs font-semibold text-[#121212] block group-hover:text-[#A8792A] truncate">
                          {item.title || `${item.color_name} ${item.dress_type}`}
                        </span>
                        <span className="text-[10px] text-[#7E6553]">
                          {item.dress_type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-[#D5C4B4] text-xs font-semibold text-[#7E6553] hover:text-[#121212]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: ERROR */}
          {status === "error" && (
            <div className="py-10 text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-editorial text-2xl font-bold text-[#121212]">
                  Try-On Incomplete
                </h4>
                <p className="text-xs text-[#7E6553] leading-relaxed">
                  {errorMessage || "We encountered an issue preparing the virtual look. Please try again."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-[#D5C4B4] text-xs font-semibold text-[#7E6553] hover:text-[#121212]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => generateLook()}
                  className="px-6 py-2.5 rounded-full bg-[#121212] text-xs font-semibold text-white shadow-luxury flex items-center gap-2 hover:bg-[#2A2A2A]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#E8DFD5] flex items-center justify-between text-[11px] text-[#7E6553]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ephemeral Privacy: User portraits are processed in-memory and never stored.</span>
          </div>
          <span className="font-mono text-[10px] text-[#A8988B] hidden sm:inline">
            OOTDiffusion • Open-Source
          </span>
        </div>
      </motion.div>
    </div>
  );
}
