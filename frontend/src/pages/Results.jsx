import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, RefreshCw, BookmarkCheck, Heart, Share2, Layers, Filter } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import RecommendationCard from "../components/RecommendationCard";
import ColorPalette from "../components/ColorPalette";
import OutfitBuilder from "../components/OutfitBuilder";
import { saveLook, getSavedLooks } from "../services/firebase";

export default function Results() {
  const navigate = useNavigate();
  const {
    analysisResults,
    selectedDress,
    selectedOccasion,
    updateDressOrOccasion,
    imagePreviewUrl
  } = useAnalysis();

  const [activeDress, setActiveDress] = useState(selectedDress || "Saree");
  const [activeOccasion, setActiveOccasion] = useState(selectedOccasion || "Wedding");
  const [favorites, setFavorites] = useState([]);
  const [activeDressColor, setActiveDressColor] = useState(null);

  // Load existing favorites on mount
  useEffect(() => {
    const loaded = getSavedLooks();
    setFavorites(loaded);
  }, []);

  // Use either actual results or our elegant default dataset if visited directly
  const data = analysisResults || {
    skin_tone: "Medium",
    undertone: "Warm",
    confidence: 0.88,
    sampled_hex: "#D8A47F",
    recommended_colors: [
      { name: "Emerald Green", hex: "#0D7A53", family: "Jewel", mood: "Regal & Luxurious" },
      { name: "Burgundy", hex: "#800020", family: "Jewel", mood: "Rich & Seductive" },
      { name: "Terracotta", hex: "#C85A32", family: "Earth", mood: "Warm & Artisanal" },
      { name: "Royal Champagne Gold", hex: "#D4AF37", family: "Metallic", mood: "Radiant & Festive" },
      { name: "Crisp Ivory", hex: "#FAF6EE", family: "Neutral", mood: "Pristine & Timeless" },
      { name: "Warm Camel", hex: "#B88E5E", family: "Neutral", mood: "Quiet Luxury" },
      { name: "Marigold Gold", hex: "#EAA221", family: "Festive", mood: "Radiant & Joyous" },
      { name: "Deep Teal", hex: "#005F60", family: "Cool", mood: "Modern & Poised" }
    ],
    palette_groups: {
      primary_power: [
        { name: "Emerald Green", hex: "#0D7A53", family: "Jewel", mood: "Regal & Luxurious" },
        { name: "Burgundy", hex: "#800020", family: "Jewel", mood: "Rich & Seductive" },
        { name: "Royal Champagne Gold", hex: "#D4AF37", family: "Metallic", mood: "Radiant & Festive" },
        { name: "Terracotta", hex: "#C85A32", family: "Earth", mood: "Warm & Artisanal" }
      ],
      harmonious_neutrals: [
        { name: "Crisp Ivory", hex: "#FAF6EE", family: "Neutral", mood: "Pristine & Timeless" },
        { name: "Warm Camel", hex: "#B88E5E", family: "Neutral", mood: "Quiet Luxury" },
        { name: "Charcoal Grey", hex: "#2C3437", family: "Neutral", mood: "Structured & Modern" }
      ],
      statement_accents: [
        { name: "Marigold Gold", hex: "#EAA221", family: "Festive", mood: "Radiant & Joyous" },
        { name: "Deep Teal", hex: "#005F60", family: "Cool", mood: "Modern & Poised" }
      ],
      approach_with_care: [
        { name: "Pewter Grey", hex: "#6D7B85", family: "Neutral", mood: "May wash out warm tones" }
      ]
    },
    outfit_combination: {
      dress: { item: selectedDress || "Saree", name: "Emerald Green", hex: "#0D7A53" },
      accessories: { name: "Polished Yellow Gold", hex: "#D4AF37" },
      footwear: { name: "Caramel Tan", hex: "#9E6843" },
      bag: { name: "Warm Sand", hex: "#C8B69E" }
    },
    styling_advice: {
      harmony_rationale: "For an estimated Medium tone with warm undertones, Emerald Green delivers striking jewel contrast without overwhelming facial features.",
      fabric_recommendation: "Opt for fluid textured weaves with subtle sheen (silk, brocade, or fine twill) to enrich color depth.",
      styling_tip: "Pair with warm yellow gold or brushed champagne accents to naturally mirror your warm undertones."
    },
    tone_description: "Golden beige to warm honey complexion. Striking with royal jewel tones, vibrant jewel reds, emeralds, and warm metallics.",
    undertone_description: "Golden, peachy, or honey undertones that glow alongside warm metals (gold, copper, brass) and earth/spice hues.",
    disclaimer: "These colors are suggested as complementary styling options based on digital image analysis. Personal confidence and individual expression always take precedence."
  };

  const handleDressOrOccasionChange = async (newDress, newOccasion) => {
    setActiveDress(newDress);
    setActiveOccasion(newOccasion);
    await updateDressOrOccasion(newDress, newOccasion);
  };

  const handleFavoriteToggle = async (color) => {
    const existing = favorites.find(
      f => f.heroColor?.hex?.toLowerCase() === color.hex?.toLowerCase()
    );

    if (existing) {
      // Remove
      const filtered = favorites.filter(f => f.id !== existing.id);
      setFavorites(filtered);
    } else {
      // Add
      const newLook = await saveLook({
        skinTone: data.skin_tone,
        undertone: data.undertone,
        dressType: activeDress,
        occasion: activeOccasion,
        heroColor: color,
        palette: [color],
        notes: `Complimentary ${color.family || "Hero"} shade for ${activeDress}.`
      });
      setFavorites(prev => [newLook, ...prev]);
    }
  };

  const handleSelectColorForOutfit = (color) => {
    setActiveDressColor(color.hex);
    // Smooth scroll to outfit builder
    const el = document.getElementById("outfit-builder-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD5]">
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7E6553] hover:text-[#121212] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload or Retake Photo</span>
        </Link>

        {/* Quick Context Switchers */}
        <div className="flex items-center gap-3">
          <select
            value={activeDress}
            onChange={(e) => handleDressOrOccasionChange(e.target.value, activeOccasion)}
            className="px-3 py-1.5 rounded-full bg-white border border-[#D5C4B4] text-xs font-semibold text-[#121212] focus:ring-2 focus:ring-[#D4AF37] outline-none"
          >
            {["Saree", "Kurti", "Shirt", "T-Shirt", "Gown", "Lehenga", "Casual Wear", "Formal Wear"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={activeOccasion}
            onChange={(e) => handleDressOrOccasionChange(activeDress, e.target.value)}
            className="px-3 py-1.5 rounded-full bg-white border border-[#D5C4B4] text-xs font-semibold text-[#121212] focus:ring-2 focus:ring-[#D4AF37] outline-none"
          >
            {["Wedding", "Party", "Festive", "Traditional", "Office", "Date / Evening", "Casual"].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <Link
            to="/favorites"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#D5C4B4] text-xs font-semibold text-[#121212] hover:bg-white transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>My Looks</span>
          </Link>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#A8792A]">
          High-Fashion Analysis
        </span>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#121212]">
          Your Personalized Palette
        </h1>
        <p className="text-xs sm:text-sm text-[#7E6553] font-light max-w-xl mx-auto leading-relaxed">
          These curated color suggestions are mathematically balanced against your skin tone's chroma, value, and lighting characteristics.
        </p>
      </div>

      {/* Complexion & Recommendation Summary Card */}
      <RecommendationCard
        skinTone={data.skin_tone}
        undertone={data.undertone}
        confidence={data.confidence}
        sampledHex={data.sampled_hex}
        toneDescription={data.tone_description}
        undertoneDescription={data.undertone_description}
        stylingAdvice={data.styling_advice}
        dressType={activeDress}
        occasion={activeOccasion}
        disclaimer={data.disclaimer}
      />

      {/* Interactive Color Palettes Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#121212]">
              Recommended Colors
            </h2>
            <p className="text-xs text-[#7E6553] mt-0.5">
              Click any color to test it in the outfit coordinator, or click the heart to save it.
            </p>
          </div>
        </div>

        <ColorPalette
          paletteGroups={data.palette_groups}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          onSelectForOutfit={handleSelectColorForOutfit}
          activeDressColor={activeDressColor}
        />
      </section>

      {/* Outfit Builder Section */}
      <section id="outfit-builder-section" className="scroll-mt-24">
        <OutfitBuilder
          initialOutfit={data.outfit_combination}
          skinTone={data.skin_tone}
          undertone={data.undertone}
          dressType={activeDress}
          occasion={activeOccasion}
          onSaved={(newLook) => setFavorites(prev => [newLook, ...prev])}
        />
      </section>
    </div>
  );
}
