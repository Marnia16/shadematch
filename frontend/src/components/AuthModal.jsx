import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup, continueAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error("Please enter your name.");
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    await continueAsGuest();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DFD5] relative">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] flex items-center justify-center mx-auto text-[#A8792A]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#121212]">
            {isSignUp ? "Create Studio Profile" : "Welcome to ShadeMatch"}
          </h3>
          <p className="text-xs text-[#7E6553]">
            {isSignUp
              ? "Save your color palettes, favorite looks, and customized styles."
              : "Sign in to access your curated wardrobe looks across devices."}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#121212]">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Clara Monet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C4B4] text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#121212]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C4B4] text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#121212]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C4B4] text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#121212] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] shadow-luxury transition-all mt-2"
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Guest Demo option */}
        <div className="mt-4 pt-4 border-t border-[#F4EFEA] space-y-3">
          <button
            type="button"
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-2.5 rounded-full border border-[#D5C4B4] text-xs font-semibold text-[#121212] hover:bg-[#FAF8F5] transition-all"
          >
            Continue as Demo Guest
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-[#7E6553] hover:text-[#121212]"
            >
              {isSignUp ? (
                <>Already have an account? <strong className="underline text-[#A8792A]">Sign In</strong></>
              ) : (
                <>New to ShadeMatch? <strong className="underline text-[#A8792A]">Create Profile</strong></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
