import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Sparkles, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import ImageUploader from "../components/ImageUploader";
import CameraCapture from "../components/CameraCapture";
import DressSelector from "../components/DressSelector";
import OccasionSelector from "../components/OccasionSelector";
import LoadingAnalysis from "../components/LoadingAnalysis";

export default function Analyze() {
  const navigate = useNavigate();
  const {
    imageFile,
    imagePreviewUrl,
    setImage,
    clearImage,
    selectedDress,
    setSelectedDress,
    selectedOccasion,
    setSelectedOccasion,
    isAnalyzing,
    startAnalysis,
    error,
    setError
  } = useAnalysis();

  const [inputMode, setInputMode] = useState("upload"); // 'upload' or 'camera'

  const handleImageSelected = (file, previewUrl, base64) => {
    setImage(file, previewUrl, base64);
    if (inputMode === "camera") {
      setInputMode("upload"); // switch back to preview view
    }
  };

  const handleStartAnalysis = async () => {
    if (!imageFile && !imagePreviewUrl) {
      setError("Please upload an image or capture a photo with your camera before analyzing.");
      return;
    }

    const success = await startAnalysis();
    if (success) {
      navigate("/results");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Loading Overlay */}
      {isAnalyzing && <LoadingAnalysis imagePreview={imagePreviewUrl} />}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] text-[11px] font-semibold text-[#A8792A] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Color Analysis Studio
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#121212]">
          Discover Your Ideal Shades
        </h1>
        <p className="text-xs sm:text-sm text-[#7E6553] font-light leading-relaxed">
          Provide a natural portrait, pick your silhouette and occasion, and let our computer vision engine formulate your complementary palette.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-3 max-w-3xl mx-auto shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-stone-400 hover:text-stone-600 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Step 1: Image Capture / Upload */}
      <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD5]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8792A] block">
              Step 1
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#121212]">
              Provide Your Photo
            </h2>
            <p className="text-xs text-[#7E6553] mt-0.5">
              Clear front-facing photos in natural daylight deliver the most harmonious color guidance.
            </p>
          </div>

          {/* Mode Switcher */}
          {!imagePreviewUrl && (
            <div className="inline-flex p-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] shadow-xs">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  inputMode === "upload"
                    ? "bg-[#121212] text-white shadow-sm"
                    : "text-[#7E6553] hover:text-[#121212]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setInputMode("camera")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  inputMode === "camera"
                    ? "bg-[#121212] text-white shadow-sm"
                    : "text-[#7E6553] hover:text-[#121212]"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Take Photo
              </button>
            </div>
          )}
        </div>

        {/* Input Interface */}
        {inputMode === "camera" && !imagePreviewUrl ? (
          <CameraCapture
            onPhotoCaptured={handleImageSelected}
            onCancel={() => setInputMode("upload")}
          />
        ) : (
          <ImageUploader
            onImageSelected={handleImageSelected}
            currentPreview={imagePreviewUrl}
            onClear={clearImage}
          />
        )}
      </section>

      {/* Step 2: Silhouette & Occasion Selection */}
      <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-10">
        <div className="pb-4 border-b border-[#E8DFD5]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8792A] block">
            Step 2
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#121212]">
            Select Silhouette & Occasion
          </h2>
          <p className="text-xs text-[#7E6553] mt-0.5">
            Different silhouettes and events warrant distinct tonal saturation, luster, and jewel contrasts.
          </p>
        </div>

        {/* 1. Dress Selector */}
        <DressSelector
          selectedDress={selectedDress}
          onSelectDress={setSelectedDress}
        />

        {/* 2. Occasion Selector */}
        <OccasionSelector
          selectedOccasion={selectedOccasion}
          onSelectOccasion={setSelectedOccasion}
        />
      </section>

      {/* Step 3: Launch Analysis CTA */}
      <div className="pt-4 flex flex-col items-center space-y-3">
        <button
          type="button"
          onClick={handleStartAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-12 py-4 rounded-full bg-[#121212] text-white text-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Analyze My Colors</span>
          <ArrowRight className="w-4 h-4 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-[11px] text-[#9E826D] text-center">
          Takes approximately 2 seconds • Photo processed in memory and never stored permanently
        </p>
      </div>
    </div>
  );
}
