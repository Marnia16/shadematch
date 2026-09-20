import React, { createContext, useContext, useState } from "react";
import { analyzeImageFile, analyzeBase64Image, fetchUpdatedRecommendations } from "../services/api";

const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1); // 1: Photo, 2: Styling choices, 3: Analyzing, 4: Complete
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  // Styling inputs
  const [selectedDress, setSelectedDress] = useState("Saree");
  const [selectedOccasion, setSelectedOccasion] = useState("Wedding");

  // Results & Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [lightingWarning, setLightingWarning] = useState(null);

  const setImage = (file, previewUrl, base64 = null) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
    setImageBase64(base64);
    setError(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageBase64(null);
    setLightingWarning(null);
    setError(null);
  };

  const startAnalysis = async () => {
    if (!imageFile && !imageBase64) {
      setError("Please upload an image or capture a photo first.");
      return false;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let results;
      if (imageFile) {
        results = await analyzeImageFile(imageFile, selectedDress, selectedOccasion);
      } else {
        results = await analyzeBase64Image(imageBase64, selectedDress, selectedOccasion);
      }

      setAnalysisResults(results);
      setIsAnalyzing(false);
      return true;
    } catch (err) {
      console.error("Analysis execution error:", err);
      setError(err.message || "Could not analyze the photo. Please ensure clear lighting and front-facing angle.");
      setIsAnalyzing(false);
      return false;
    }
  };

  const updateDressOrOccasion = async (newDress, newOccasion) => {
    setSelectedDress(newDress);
    setSelectedOccasion(newOccasion);

    if (analysisResults) {
      try {
        const updated = await fetchUpdatedRecommendations(
          analysisResults.skin_tone,
          analysisResults.undertone,
          newDress,
          newOccasion
        );
        setAnalysisResults(prev => ({
          ...prev,
          recommended_colors: updated.recommended_colors,
          palette_groups: updated.palette_groups,
          outfit_combination: updated.outfit_combination,
          styling_advice: updated.styling_advice
        }));
      } catch (e) {
        console.warn("Failed to dynamically update recommendations:", e);
      }
    }
  };

  const resetAll = () => {
    clearImage();
    setSelectedDress("Saree");
    setSelectedOccasion("Wedding");
    setAnalysisResults(null);
    setError(null);
    setLightingWarning(null);
    setCurrentStep(1);
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        imageFile,
        imagePreviewUrl,
        imageBase64,
        setImage,
        clearImage,
        selectedDress,
        setSelectedDress,
        selectedOccasion,
        setSelectedOccasion,
        isAnalyzing,
        analysisResults,
        error,
        setError,
        lightingWarning,
        setLightingWarning,
        startAnalysis,
        updateDressOrOccasion,
        resetAll
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
