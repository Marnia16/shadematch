import React from "react";
import { Sun, AlertTriangle, Info } from "lucide-react";

export default function LightingAlert({ qualityData }) {
  if (!qualityData || qualityData.status === "optimal" || !qualityData.warning) {
    return null;
  }

  const isDark = qualityData.status === "dark";
  const isDim = qualityData.status === "dim";
  const isOverexposed = qualityData.status === "overexposed";

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all text-xs ${
        isDark
          ? "bg-amber-50/90 border-amber-200 text-amber-900"
          : isDim
          ? "bg-stone-50 border-stone-200 text-stone-800"
          : "bg-blue-50/80 border-blue-200 text-blue-900"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isDark ? (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
      <div className="space-y-0.5">
        <span className="font-semibold block">
          {isDark
            ? "Low Light Advisory"
            : isOverexposed
            ? "High Glare Detected"
            : "Lighting Quality Note"}
        </span>
        <p className="leading-relaxed opacity-90">{qualityData.warning}</p>
      </div>
    </div>
  );
}
