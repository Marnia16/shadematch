import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, RefreshCw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { validateImageFile, quickClientLightingCheck } from "../utils/imageHelpers";
import LightingAlert from "./LightingAlert";

export default function ImageUploader({ onImageSelected, currentPreview, onClear }) {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [lightingInfo, setLightingInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setLocalError(validation.error);
      return;
    }

    setLocalError(null);
    const previewUrl = URL.createObjectURL(file);

    // Read base64 for backup and lighting check
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target.result;
      const img = new Image();
      img.onload = () => {
        const lighting = quickClientLightingCheck(img);
        setLightingInfo(lighting);
      };
      img.src = b64;
      onImageSelected(file, previewUrl, b64);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setLocalError(null);
    setLightingInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear();
  };

  return (
    <div className="w-full space-y-4">
      {currentPreview ? (
        <div className="glass-panel p-6 rounded-2xl border border-[#E8DFD5] shadow-luxury space-y-4">
          <div className="relative aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-stone-100 border border-[#D5C4B4] shadow-inner group">
            <img
              src={currentPreview}
              alt="Uploaded portrait"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-full bg-white text-xs font-semibold text-luxury-dark shadow-md flex items-center gap-1.5 hover:bg-stone-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 rounded-full bg-rose-600 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 hover:bg-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#7E6553] pt-2 border-t border-[#F4EFEA]">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Photo loaded & pre-screened
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-[#121212] underline underline-offset-2"
              >
                Change photo
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-rose-600 underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          </div>

          {lightingInfo && <LightingAlert qualityData={lightingInfo} />}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-[#D4AF37] bg-amber-50/50 scale-[1.01]"
              : "border-[#D5C4B4] hover:border-[#BAA28E] bg-white/70 hover:bg-white"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center text-[#9E826D] shadow-sm">
              <UploadCloud className="w-8 h-8 text-[#A8792A]" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="text-base font-medium text-[#121212]">
                Drag and drop your photo here
              </p>
              <p className="text-xs text-[#7E6553]">
                or <span className="text-[#A8792A] font-semibold underline underline-offset-2">browse files</span> on your computer or phone
              </p>
            </div>
            <p className="text-[11px] text-[#9E826D] tracking-wide">
              Supports high-resolution JPEG, PNG, or WEBP (up to 15 MB)
            </p>
          </div>
        </div>
      )}

      {localError && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
}
