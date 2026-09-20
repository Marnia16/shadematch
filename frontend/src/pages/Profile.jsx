import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Heart, Sparkles, LogOut, Check, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSavedLooks } from "../services/firebase";
import { DRESS_TYPES } from "../data/dressTypes";
import { OCCASIONS } from "../data/occasions";

export default function Profile() {
  const { user, logout, openAuthModal, updatePreferences } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [preferredDresses, setPreferredDresses] = useState([]);
  const [preferredOccasions, setPreferredOccasions] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const looks = getSavedLooks();
    setSavedCount(looks.length);

    if (user) {
      setPreferredDresses(user.preferredDressCategories || ["Saree", "Gown"]);
      setPreferredOccasions(user.preferredOccasions || ["Wedding", "Date / Evening"]);
    }
  }, [user]);

  const toggleDress = (name) => {
    setPreferredDresses(prev =>
      prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
    );
  };

  const toggleOccasion = (name) => {
    setPreferredOccasions(prev =>
      prev.includes(name) ? prev.filter(o => o !== name) : [...prev, name]
    );
  };

  const handleSavePreferences = () => {
    updatePreferences({
      preferredDressCategories: preferredDresses,
      preferredOccasions: preferredOccasions
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Profile Header Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#E8DFD5] shadow-luxury flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md p-1 bg-white">
            <img
              src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={user?.displayName || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#121212]">
                {user ? user.displayName : "Aria Vance"}
              </h1>
              {user?.isAnonymous && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold uppercase tracking-wider">
                  Guest Mode
                </span>
              )}
            </div>

            <p className="text-xs text-[#7E6553] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#9E826D]" />
              <span>{user ? user.email : "aria.vance@fashiontech.studio"}</span>
            </p>

            <p className="text-[11px] text-[#A8792A] font-semibold pt-1">
              Member of ShadeMatch Haute Studio
            </p>
          </div>
        </div>

        {/* Auth Action */}
        <div>
          {user && !user.isAnonymous ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-full bg-[#121212] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center text-[#D4AF37]">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E826D] block">
              Saved Looks
            </span>
            <span className="font-editorial text-3xl font-bold text-[#121212]">
              {savedCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center text-[#A8792A]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E826D] block">
              Favored Silhouettes
            </span>
            <span className="font-editorial text-lg font-bold text-[#121212] truncate block">
              {preferredDresses.length > 0 ? preferredDresses.join(", ") : "Saree, Gown"}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E826D] block">
              Data Privacy
            </span>
            <span className="text-xs font-bold text-[#121212] block">
              Local & Ephemeral
            </span>
          </div>
        </div>
      </div>

      {/* Style Preferences Editor */}
      <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#E8DFD5] shadow-luxury space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD5]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8792A] block">
              Wardrobe Customization
            </span>
            <h2 className="font-editorial text-2xl font-bold text-[#121212]">
              Personal Style Preferences
            </h2>
            <p className="text-xs text-[#7E6553] mt-0.5">
              Select your go-to silhouettes and occasions so recommendations cater to your routine.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-luxury transition-all ${
              saveSuccess ? "bg-emerald-700" : "bg-[#121212] hover:bg-[#2A2A2A]"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>

        {/* Preferred Dresses */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#121212]">
            Preferred Dress Silhouettes
          </h3>
          <div className="flex flex-wrap gap-2">
            {DRESS_TYPES.map((dress) => {
              const isSelected = preferredDresses.includes(dress.name);
              return (
                <button
                  key={dress.id}
                  type="button"
                  onClick={() => toggleDress(dress.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#121212] text-white shadow-sm ring-1 ring-[#D4AF37]"
                      : "bg-white border border-[#E8DFD5] text-[#7E6553] hover:bg-stone-50"
                  }`}
                >
                  {dress.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Occasions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#121212]">
            Preferred Occasions
          </h3>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => {
              const isSelected = preferredOccasions.includes(occ.name);
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => toggleOccasion(occ.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#121212] text-white shadow-sm ring-1 ring-[#D4AF37]"
                      : "bg-white border border-[#E8DFD5] text-[#7E6553] hover:bg-stone-50"
                  }`}
                >
                  {occ.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
