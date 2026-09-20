import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-[#FAF8F5] border-t border-[#2A2A2A] pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2A2A2A]">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#121212] font-bold font-editorial text-sm">
                S
              </div>
              <span className="font-editorial text-2xl font-bold tracking-widest uppercase text-white">
                ShadeMatch
              </span>
            </div>
            <p className="text-sm text-[#BAA28E] max-w-md leading-relaxed">
              Personalized color harmony studio designed at the intersection of computer vision,
              dermatological colorimetry, and haute fashion curation.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#9E826D] pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                Ephemeral Image Processing
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
                Inclusive Spectrum Science
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Studio
            </h4>
            <ul className="space-y-2 text-sm text-[#BAA28E]">
              <li>
                <Link to="/analyze" className="hover:text-white transition-colors">
                  Color Analysis
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Seasonal Palettes
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition-colors">
                  Saved Looks
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Style Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Color Philosophy */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Styling Philosophy
            </h4>
            <p className="text-xs text-[#9E826D] leading-relaxed">
              Color recommendations are crafted as personalized complementary styling suggestions.
              We believe confidence and personal expression remain the ultimate sartorial statements.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7E6553] gap-4">
          <p>© {new Date().getFullYear()} ShadeMatch Fashion-Tech. Built with React & OpenCV.</p>
          <div className="flex items-center gap-6">
            <span>No permanent image storage</span>
            <span>Local & Privacy First</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
