import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Scan, Palette, Eye } from "lucide-react";

const STAGES = [
  {
    message: "Analyzing your image...",
    subtext: "Calibrating lighting, contrast, and digital color balance",
    icon: Scan,
    percent: 25
  },
  {
    message: "Identifying facial regions...",
    subtext: "Detecting forehead and cheek contours to isolate skin chromaticity",
    icon: Eye,
    percent: 50
  },
  {
    message: "Analyzing color characteristics...",
    subtext: "Calculating CIELAB coordinates, ITA angles, and undertone harmonies",
    icon: Palette,
    percent: 75
  },
  {
    message: "Preparing your personalized palette...",
    subtext: "Matching silhouette, fabric weights, and occasion formality",
    icon: Sparkles,
    percent: 95
  }
];

export default function LoadingAnalysis({ imagePreview }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const current = STAGES[stageIndex];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/90 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#18181B] border border-white/10 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Scanning Viewport */}
        <div className="relative w-44 h-44 mx-auto mb-8 rounded-full overflow-hidden border-2 border-[#D4AF37]/40 shadow-glow p-1 bg-black/60">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Scan in progress"
              className="w-full h-full object-cover rounded-full filter grayscale contrast-125"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-stone-600">
              <Scan className="w-16 h-16" />
            </div>
          )}

          {/* Animated Scanning Beam */}
          <motion.div
            className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37]"
            animate={{
              top: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Concentric rotating radar rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Staged Content */}
        <div className="min-h-[90px] flex flex-col items-center justify-center space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#D4AF37] mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span className="font-semibold tracking-wider uppercase text-[10px]">
                  Step {stageIndex + 1} of 4
                </span>
              </div>
              <h3 className="font-editorial text-2xl font-bold tracking-wide text-white">
                {current.message}
              </h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                {current.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#A8792A] via-[#D4AF37] to-[#F3E5AB] rounded-full"
              initial={{ width: "15%" }}
              animate={{ width: `${current.percent}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 font-medium">
            <span>Biometric Colorimetry</span>
            <span>{current.percent}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
