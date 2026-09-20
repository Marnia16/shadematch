import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Camera, Shirt, Palette, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Home() {
  const featuredSwatches = [
    { name: "Emerald Green", hex: "#0D7A53", role: "Royal Jewel" },
    { name: "Burgundy", hex: "#800020", role: "Sensual Wine" },
    { name: "Royal Champagne", hex: "#D4AF37", role: "Festive Sheen" },
    { name: "Terracotta", hex: "#C85A32", role: "Warm Earth" },
    { name: "Navy Blue", hex: "#12263F", role: "Tailored Classic" },
    { name: "Dusty Rose", hex: "#C98A8E", role: "Romantic Pastel" }
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Your Photo",
      desc: "Upload a portrait or use our studio webcam. Our OpenCV vision engine detects facial skin chromaticity with natural lighting calibration.",
      icon: Camera
    },
    {
      num: "02",
      title: "Choose Outfit & Occasion",
      desc: "Specify your silhouette—from a bridal Banarasi Saree or festive Lehenga to an executive Shirt—and calibrate for the occasion.",
      icon: Shirt
    },
    {
      num: "03",
      title: "Get Personalized Colors",
      desc: "Receive power colors, quiet neutrals, statement accents, and a live 4-piece outfit builder tailored to your estimated tone.",
      icon: Palette
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold tracking-widest text-[#7E6553] uppercase">
                AI & Computer Vision Fashion Studio
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#121212] leading-[1.08]">
                Find the Colors That Complement You.
              </h1>
              <p className="text-base sm:text-lg text-[#7E6553] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Discover personalized dress colors based on your skin-tone range, outfit type, and occasion—formulated with dermatological colorimetry and haute styling principles.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/analyze"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#121212] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group"
              >
                <span>Discover Your Colors</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/explore"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#121212] text-xs sm:text-sm font-semibold uppercase tracking-wider border border-[#D5C4B4] hover:bg-stone-50 hover:border-[#121212] transition-all flex items-center justify-center"
              >
                Explore Color Palettes
              </Link>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#9E826D]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero permanent image storage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Dermatological ITA Colorimetry
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Context-aware silhouette tuning
              </span>
            </div>
          </motion.div>

          {/* Right Hero Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient backing glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#D4AF37]/20 via-transparent to-rose-200/30 rounded-3xl blur-2xl -z-10" />

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8792A] block">
                    Curated Swatches
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-[#121212]">
                    High-Chroma Harmony
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center text-[#D4AF37]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Interactive Swatch Stack */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {featuredSwatches.map((swatch) => (
                  <div
                    key={swatch.name}
                    className="p-3 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs hover:shadow-md transition-all hover:scale-105 flex flex-col space-y-2 cursor-pointer group"
                  >
                    <div
                      className="w-full h-16 rounded-xl shadow-inner transition-transform group-hover:scale-95"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div>
                      <span className="font-editorial text-xs font-bold text-[#121212] block truncate">
                        {swatch.name}
                      </span>
                      <span className="text-[10px] text-[#7E6553] block mt-0.5">
                        {swatch.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Analysis Callout */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#121212]">
                  <span>Estimated Complexion</span>
                  <span className="text-[#A8792A]">Warm Honey Range</span>
                </div>
                <p className="text-xs text-[#7E6553] leading-relaxed">
                  "Emerald Green and Burgundy deliver rich jewel-tone contrast, counterbalancing golden undertones with effortless elegance."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8792A]">
            The Haute Process
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#121212]">
            How ShadeMatch Works
          </h2>
          <p className="text-sm text-[#7E6553]">
            A seamless three-step ritual powered by computer vision, color science, and editorial fashion rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="glass-panel p-8 rounded-3xl border border-[#E8DFD5] shadow-luxury flex flex-col justify-between space-y-6 hover:border-[#D4AF37] transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center text-[#121212] group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-editorial text-2xl font-bold text-[#D5C4B4] group-hover:text-[#D4AF37] transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-[#121212]">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7E6553] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA]">
                  <span className="text-[11px] font-semibold text-[#A8792A] uppercase tracking-wider">
                    Instant & Private
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Teaser CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#121212] text-white rounded-3xl p-8 sm:p-16 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Begin Your Sartorial Journey
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight">
              Ready to discover your complimentary color palette?
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-light">
              Join discerning individuals who curate their wardrobes with science, intention, and timeless aesthetic poise.
            </p>
            <div className="pt-2">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#121212] text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-stone-100 shadow-luxury transition-all"
              >
                <span>Launch Color Studio</span>
                <ArrowRight className="w-4 h-4 text-[#A8792A]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
