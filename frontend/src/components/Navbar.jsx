import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Heart, Compass, User, Menu, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { checkBackendHealth } from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const { user, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.healthy));
  }, []);

  const navLinks = [
    { name: "Color Studio", path: "/analyze", icon: Sparkles },
    { name: "My Looks", path: "/favorites", icon: Heart },
    { name: "Explore Palettes", path: "/explore", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#E8DFD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#121212] via-[#2A2A2A] to-[#D4AF37] p-[1.5px] shadow-sm transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center">
                <span className="font-editorial text-gold text-lg italic font-bold">S</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-bold tracking-widest text-[#121212] uppercase group-hover:text-[#A8792A] transition-colors">
                ShadeMatch
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#7E6553] uppercase font-medium -mt-1">
                Haute Colorimetry
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-sm tracking-wide font-medium transition-colors py-1 relative ${
                    isActive ? "text-[#121212] font-semibold" : "text-[#7E6553] hover:text-[#121212]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-[#9E826D]"}`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Backend status & Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Backend connection pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendOnline
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
              title={backendOnline ? "FastAPI Computer Vision engine connected" : "Local engine active"}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="text-[11px] font-sans">
                {backendOnline ? "AI Engine Live" : "Local Engine"}
              </span>
            </div>

            {/* Profile / Auth trigger */}
            {user && !user.isAnonymous ? (
              <Link
                to="/profile"
                className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border border-[#E8DFD5] hover:border-[#D4AF37] transition-all bg-white"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover border border-[#D5C4B4]"
                />
                <span className="text-xs font-medium text-[#121212] max-w-[100px] truncate">
                  {user.displayName}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-white transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>
            )}

            {/* Discover CTA */}
            <Link
              to="/analyze"
              className="px-5 py-2.5 rounded-full text-xs tracking-wider uppercase font-semibold text-white bg-[#121212] hover:bg-[#2A2A2A] shadow-luxury transition-all transform hover:-translate-y-0.5"
            >
              Start Analysis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#121212] hover:bg-[#F4EFEA]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD5] bg-white px-4 pt-4 pb-6 space-y-3">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? "bg-[#FAF8F5] text-[#121212] font-bold" : "text-[#7E6553]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#D4AF37]" : "text-[#9E826D]"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#F4EFEA] flex flex-col gap-2">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#121212] font-medium"
            >
              <User className="w-4 h-4 text-[#9E826D]" />
              <span>{user ? user.displayName : "Sign In / Profile"}</span>
            </Link>
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#121212]"
            >
              Discover Your Colors
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
