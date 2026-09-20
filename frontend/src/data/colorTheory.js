export const SEASONAL_PALETTES = [
  {
    id: "autumn",
    season: "Warm Autumn",
    tagline: "Rich, Earthy, Golden Radiance",
    description: "Characterized by golden warmth and deep contrast. Think fallen maple leaves, spices, and rich terra-cotta.",
    swatches: [
      { name: "Terracotta", hex: "#C85A32" },
      { name: "Olive Green", hex: "#556B2F" },
      { name: "Mustard Ochre", hex: "#DDAA33" },
      { name: "Warm Cinnamon", hex: "#7E3517" },
      { name: "Espresso", hex: "#362B28" }
    ],
    bestMetals: "Polished Yellow Gold, Brass, Copper",
    powerFabric: "Velvet, Raw Silk, Fine Wool Tweed"
  },
  {
    id: "winter",
    season: "Cool Winter",
    tagline: "Crisp, Vivid, High-Contrast Jewels",
    description: "High saturation with striking cool undertones. Thrives on jewel tones and stark contrast.",
    swatches: [
      { name: "Sapphire Blue", hex: "#0F52BA" },
      { name: "Ruby Red", hex: "#9B111E" },
      { name: "Emerald Green", hex: "#0D7A53" },
      { name: "Pristine White", hex: "#FAF6EE" },
      { name: "Midnight Black", hex: "#121212" }
    ],
    bestMetals: "White Gold, Sterling Silver, Platinum",
    powerFabric: "Satin, Heavy Crepe, Structured Twill"
  },
  {
    id: "spring",
    season: "Light Spring",
    tagline: "Luminous, Fresh, Warm Pastels",
    description: "Delicate warmth combined with clarity. Evokes blooming orchards, coral reefs, and morning sunlight.",
    swatches: [
      { name: "Peach Blossom", hex: "#E89B7B" },
      { name: "Coral Sunset", hex: "#EB634B" },
      { name: "Champagne Gold", hex: "#D4AF37" },
      { name: "Seafoam Mint", hex: "#7AB8A4" },
      { name: "Warm Camel", hex: "#B88E5E" }
    ],
    bestMetals: "Light Yellow Gold, Rose Gold",
    powerFabric: "Organza, Chiffon, Linen"
  },
  {
    id: "summer",
    season: "Soft Summer",
    tagline: "Gentle, Muted, Misty Coastal Tones",
    description: "Cool, soft, and slightly desaturated shades with understated, poetic refinement.",
    swatches: [
      { name: "Dusty Rose", hex: "#C98A8E" },
      { name: "Slate Blue", hex: "#476A85" },
      { name: "Sage Mist", hex: "#8A9A86" },
      { name: "Lavender Frost", hex: "#9B8FA9" },
      { name: "Pewter Grey", hex: "#6D7B85" }
    ],
    bestMetals: "Brushed Silver, Rose Gold, Pearls",
    powerFabric: "Georgette, Mulmul Cotton, Cashmere"
  }
];

export const UNDERTONE_GUIDE = [
  {
    type: "Warm",
    veinColor: "Greenish veins in natural sunlight",
    jewelryPreference: "Yellow gold and warm bronze illuminate your skin",
    sunReaction: "Tans readily with a golden or olive glow",
    keyCompliments: "Warm earth tones, peach, amber, olive, terracotta, warm ivory",
    avoidUnblended: "Icy silvers, stark stark blue-white"
  },
  {
    type: "Cool",
    veinColor: "Blue or purple veins at the wrist",
    jewelryPreference: "Silver, platinum, and white gold make your skin sparkle",
    sunReaction: "Burns easily or turns pink before developing subtle tan",
    keyCompliments: "Jewel sapphire, ruby red, emerald, plum, slate blue, pure crisp black",
    avoidUnblended: "Mustard ochre, orange-yellow"
  },
  {
    type: "Neutral",
    veinColor: "Blend of blue-green veins",
    jewelryPreference: "Equally flattered by gold, silver, and rose gold",
    sunReaction: "Tans moderately with subtle pinkish warmth",
    keyCompliments: "Virtually the full spectrum: dusty rose, jade green, charcoal, champagne",
    avoidUnblended: "Extremely neon or hyper-saturated clashes without neutral balancing"
  }
];
