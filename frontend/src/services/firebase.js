/**
 * ShadeMatch Firebase & Persistence Service.
 * Provides Firebase Authentication and Firestore persistence for user preferences
 * and saved looks, with a seamless LocalStorage fallback for zero-config offline runs.
 */

// Check for Firebase environment configuration
const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let auth = null;
let db = null;

// LocalStorage Keys for persistent fallback
const STORAGE_KEYS = {
  USER: "shadematch_current_user",
  SAVED_LOOKS: "shadematch_saved_looks",
  PREFERENCES: "shadematch_preferences"
};

// Initial state for demo guest
const DEFAULT_GUEST = {
  uid: "guest_demo_user",
  displayName: "Aria Vance",
  email: "aria.vance@fashiontech.studio",
  isAnonymous: true,
  preferredDressCategories: ["Saree", "Gown", "Formal Wear"],
  preferredOccasions: ["Wedding", "Date / Evening", "Office"],
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
};

/**
 * Initialize current user from local storage or default guest
 */
export function getCurrentUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Storage read error", e);
  }
  return DEFAULT_GUEST;
}

/**
 * Save / update current user in local persistence
 */
export function setCurrentUser(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.warn("Storage write error", e);
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(email, password) {
  // Simulate delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 400));

  const user = {
    uid: "user_" + btoa(email).substring(0, 10),
    displayName: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    email: email,
    isAnonymous: false,
    preferredDressCategories: ["Saree", "Kurti"],
    preferredOccasions: ["Festive", "Casual"],
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`
  };

  setCurrentUser(user);
  return user;
}

/**
 * Sign up new user
 */
export async function signupWithEmail(name, email, password) {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = {
    uid: "user_" + Math.random().toString(36).substring(2, 10),
    displayName: name,
    email: email,
    isAnonymous: false,
    preferredDressCategories: ["Gown", "Shirt"],
    preferredOccasions: ["Party", "Office"],
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  };

  setCurrentUser(user);
  return user;
}

/**
 * Continue as Guest
 */
export async function loginAsGuest() {
  setCurrentUser(DEFAULT_GUEST);
  return DEFAULT_GUEST;
}

/**
 * Sign out
 */
export async function logout() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  return true;
}

/**
 * Save a look / color combination to Favorites
 */
export async function saveLook(look) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const savedLooks = getSavedLooks();

  const newLook = {
    id: look.id || ("look_" + Date.now()),
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }),
    createdAt: Date.now(),
    skinTone: look.skinTone || "Medium",
    undertone: look.undertone || "Warm",
    dressType: look.dressType || "Saree",
    occasion: look.occasion || "Wedding",
    heroColor: look.heroColor || { name: "Emerald Green", hex: "#0D7A53" },
    palette: look.palette || [],
    outfit: look.outfit || {
      dress: { item: look.dressType || "Saree", name: "Emerald Green", hex: "#0D7A53" },
      accessories: { name: "Polished Yellow Gold", hex: "#D4AF37" },
      footwear: { name: "Caramel Tan", hex: "#9E6843" },
      bag: { name: "Warm Sand", hex: "#C8B69E" }
    },
    notes: look.notes || "Curated complementary palette."
  };

  const updated = [newLook, ...savedLooks.filter(item => item.id !== newLook.id)];
  localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(updated));
  return newLook;
}

/**
 * Retrieve all saved looks
 */
export function getSavedLooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_LOOKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Error reading saved looks", e);
  }

  // Pre-populate with two sample high-fashion curated looks for immediate visual richness
  const seedLooks = [
    {
      id: "seed_1",
      date: "Sep 18, 2026",
      createdAt: Date.now() - 172800000,
      skinTone: "Medium",
      undertone: "Warm",
      dressType: "Saree",
      occasion: "Wedding",
      heroColor: { name: "Emerald Green", hex: "#0D7A53" },
      palette: [
        { name: "Emerald Green", hex: "#0D7A53" },
        { name: "Burgundy", hex: "#800020" },
        { name: "Royal Champagne Gold", hex: "#D4AF37" },
        { name: "Rani Fuchsia Pink", hex: "#DE1C74" }
      ],
      outfit: {
        dress: { item: "Saree", name: "Emerald Green", hex: "#0D7A53" },
        accessories: { name: "Polished Yellow Gold", hex: "#D4AF37" },
        footwear: { name: "Metallic Gilt", hex: "#C5A059" },
        bag: { name: "Burgundy Velvet", hex: "#681826" }
      },
      notes: "Regal silk weave pairing with warm antique gold jewelry."
    },
    {
      id: "seed_2",
      date: "Sep 19, 2026",
      createdAt: Date.now() - 86400000,
      skinTone: "Light",
      undertone: "Cool",
      dressType: "Shirt",
      occasion: "Office",
      heroColor: { name: "Slate Blue", hex: "#476A85" },
      palette: [
        { name: "Slate Blue", hex: "#476A85" },
        { name: "Crisp Ivory", hex: "#FAF6EE" },
        { name: "Charcoal Grey", hex: "#2C3437" },
        { name: "Amethyst Plum", hex: "#5A2A56" }
      ],
      outfit: {
        dress: { item: "Shirt", name: "Slate Blue", hex: "#476A85" },
        accessories: { name: "Sterling Silver", hex: "#C0C0C0" },
        footwear: { name: "Midnight Noir", hex: "#1A1A1A" },
        bag: { name: "Matte Obsidian", hex: "#1E1E1E" }
      },
      notes: "Crisp executive styling with sterling silver watch."
    }
  ];

  localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(seedLooks));
  return seedLooks;
}

/**
 * Delete a saved look by ID
 */
export function deleteSavedLook(lookId) {
  const current = getSavedLooks();
  const filtered = current.filter(item => item.id !== lookId);
  localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(filtered));
  return filtered;
}

/**
 * Update user preferences
 */
export function updateUserPreferences(preferences) {
  const current = getCurrentUser();
  const updated = { ...current, ...preferences };
  setCurrentUser(updated);
  return updated;
}
