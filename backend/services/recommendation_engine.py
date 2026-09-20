"""
Fashion Recommendation Engine for ShadeMatch.
Synthesizes (skin_tone, undertone, dress_type, occasion) into
curated color palettes, styling rationale, and 4-piece outfit combinations.
"""

from typing import Dict, Any, List

# Core Color Master Palette with Hex and Contrast notes
PALETTE_LIBRARY = {
    # Jewel Tones
    "emerald_green": {"name": "Emerald Green", "hex": "#0D7A53", "family": "Jewel", "mood": "Regal & Luxurious"},
    "burgundy": {"name": "Burgundy", "hex": "#800020", "family": "Jewel", "mood": "Rich & Seductive"},
    "sapphire_blue": {"name": "Sapphire Blue", "hex": "#0F52BA", "family": "Jewel", "mood": "Striking & Confident"},
    "ruby_red": {"name": "Ruby Red", "hex": "#9B111E", "family": "Jewel", "mood": "Passionate & Dramatic"},
    "amethyst_plum": {"name": "Plum Amethyst", "hex": "#5A2A56", "family": "Jewel", "mood": "Sophisticated & Regal"},
    "royal_gold": {"name": "Royal Champagne Gold", "hex": "#D4AF37", "family": "Metallic", "mood": "Radiant & Festive"},

    # Warm Earth & Spice
    "terracotta": {"name": "Terracotta", "hex": "#C85A32", "family": "Earth", "mood": "Warm & Artisanal"},
    "mustard_ochre": {"name": "Mustard Ochre", "hex": "#DDAA33", "family": "Earth", "mood": "Radiant & Earthy"},
    "burnt_orange": {"name": "Burnt Orange", "hex": "#C04000", "family": "Earth", "mood": "Vibrant Autumnal"},
    "warm_cinnamon": {"name": "Warm Cinnamon", "hex": "#7E3517", "family": "Earth", "mood": "Cozy & Tailored"},
    "olive_green": {"name": "Olive Green", "hex": "#556B2F", "family": "Earth", "mood": "Understated & Modern"},
    "copper_rust": {"name": "Rust Copper", "hex": "#B85D34", "family": "Earth", "mood": "Lustrous & Grounded"},

    # Cool Coastal & Forest
    "navy_blue": {"name": "Navy Blue", "hex": "#12263F", "family": "Classic", "mood": "Authoritative & Sleek"},
    "teal": {"name": "Deep Teal", "hex": "#005F60", "family": "Cool", "mood": "Modern & Poised"},
    "forest_green": {"name": "Forest Green", "hex": "#1E4620", "family": "Cool", "mood": "Deep & Grounded"},
    "slate_blue": {"name": "Slate Blue", "hex": "#476A85", "family": "Cool", "mood": "Serene & Professional"},
    "cobalt": {"name": "Cobalt Blue", "hex": "#0047AB", "family": "Vibrant", "mood": "Bold & Contemporary"},

    # Pastels & Ethereal Tones
    "dusty_rose": {"name": "Dusty Rose", "hex": "#C98A8E", "family": "Pastel", "mood": "Romantic & Gentle"},
    "sage_green": {"name": "Sage Mist", "hex": "#8A9A86", "family": "Pastel", "mood": "Refined & Botanical"},
    "lavender_ice": {"name": "Lavender Frost", "hex": "#9B8FA9", "family": "Pastel", "mood": "Dreamy & Subtle"},
    "peach_blush": {"name": "Peach Blossom", "hex": "#E89B7B", "family": "Pastel", "mood": "Youthful & Soft"},
    "powder_blue": {"name": "Powder Blue", "hex": "#9EBACF", "family": "Pastel", "mood": "Crisp & Airy"},
    "mint_water": {"name": "Seafoam Mint", "hex": "#7AB8A4", "family": "Pastel", "mood": "Breezy & Refreshing"},

    # High Neutrals & Staples
    "crisp_ivory": {"name": "Crisp Ivory", "hex": "#FAF6EE", "family": "Neutral", "mood": "Pristine & Timeless"},
    "charcoal": {"name": "Charcoal Grey", "hex": "#2C3437", "family": "Neutral", "mood": "Structured & Modern"},
    "camel": {"name": "Warm Camel", "hex": "#B88E5E", "family": "Neutral", "mood": "Quiet Luxury & Luxe"},
    "espresso": {"name": "Espresso Brown", "hex": "#362B28", "family": "Neutral", "mood": "Rich & Grounded"},
    "champagne": {"name": "Soft Champagne", "hex": "#EAD7BA", "family": "Neutral", "mood": "Delicate & Luminous"},
    "pure_black": {"name": "Midnight Black", "hex": "#121212", "family": "Neutral", "mood": "Iconic & Sharp"},
    "pewter_grey": {"name": "Pewter Grey", "hex": "#6D7B85", "family": "Neutral", "mood": "Cool & Balanced"},

    # Vibrant & Festive Accents
    "rani_pink": {"name": "Rani Fuchsia Pink", "hex": "#DE1C74", "family": "Festive", "mood": "Vibrant & Celebratory"},
    "marigold": {"name": "Marigold Gold", "hex": "#EAA221", "family": "Festive", "mood": "Radiant & Joyous"},
    "electric_violet": {"name": "Electric Violet", "hex": "#6A0DAD", "family": "Vibrant", "mood": "Avant-Garde & Bold"},
    "coral_sunset": {"name": "Coral Sunset", "hex": "#EB634B", "family": "Vibrant", "mood": "Energetic & Fresh"},
    "crimson_wine": {"name": "Crimson Wine", "hex": "#8B1E3F", "family": "Jewel", "mood": "Sensual & Dramatic"}
}


# Coordinates Library for 4-piece look builder
COORDINATES = {
    "accessories": {
        "gold": {"name": "Polished Yellow Gold", "hex": "#D4AF37"},
        "rose_gold": {"name": "Warm Rose Gold", "hex": "#B76E79"},
        "silver": {"name": "Sterling Silver", "hex": "#C0C0C0"},
        "platinum": {"name": "Burnished Platinum", "hex": "#E5E4E2"},
        "pearl": {"name": "Luminous Freshwater Pearl", "hex": "#F0EAD6"},
        "antique_brass": {"name": "Oxidized Antique Brass", "hex": "#8B7355"}
    },
    "footwear": {
        "nude": {"name": "Nude Blush", "hex": "#DEBA9D"},
        "caramel": {"name": "Caramel Tan", "hex": "#9E6843"},
        "classic_black": {"name": "Midnight Noir", "hex": "#1A1A1A"},
        "metallic_gold": {"name": "Metallic Gilt", "hex": "#C5A059"},
        "metallic_silver": {"name": "Mirror Silver", "hex": "#D3D3D3"},
        "deep_oxblood": {"name": "Burnished Oxblood", "hex": "#4A121A"}
    },
    "bags": {
        "beige": {"name": "Warm Sand", "hex": "#C8B69E"},
        "cognac": {"name": "Cognac Leather", "hex": "#8A4927"},
        "black": {"name": "Matte Obsidian", "hex": "#1E1E1E"},
        "emerald": {"name": "Forest Green Suede", "hex": "#154734"},
        "champagne": {"name": "Champagne Satin", "hex": "#E2D3B8"},
        "burgundy": {"name": "Burgundy Velvet", "hex": "#681826"}
    }
}


class RecommendationEngine:
    def generate_recommendations(
        self,
        skin_tone: str,
        undertone: str,
        dress_type: str,
        occasion: str
    ) -> Dict[str, Any]:
        """
        Produces personalized recommendations conditioned on:
        (skin_tone, undertone, dress_type, occasion).
        """
        dress_key = dress_type.lower().strip()
        occasion_key = occasion.lower().strip()

        # Step 1: Base Palette Selection based on Tone & Undertone
        primary_keys = []
        neutral_keys = []
        accent_keys = []
        caution_keys = []

        if skin_tone == "Fair":
            if undertone == "Cool":
                primary_keys = ["sapphire_blue", "ruby_red", "emerald_green", "dusty_rose"]
                neutral_keys = ["charcoal", "pewter_grey", "crisp_ivory"]
                accent_keys = ["amethyst_plum", "powder_blue", "rani_pink"]
                caution_keys = ["mustard_ochre"]
            elif undertone == "Warm":
                primary_keys = ["peach_blush", "dusty_rose", "coral_sunset", "sage_green"]
                neutral_keys = ["camel", "champagne", "crisp_ivory"]
                accent_keys = ["terracotta", "mint_water", "royal_gold"]
                caution_keys = ["pure_black"]
            else:
                primary_keys = ["navy_blue", "emerald_green", "dusty_rose", "ruby_red"]
                neutral_keys = ["pewter_grey", "champagne", "charcoal"]
                accent_keys = ["powder_blue", "amethyst_plum", "sage_green"]
                caution_keys = ["mustard_ochre"]

        elif skin_tone == "Light":
            if undertone == "Cool":
                primary_keys = ["amethyst_plum", "sapphire_blue", "slate_blue", "ruby_red"]
                neutral_keys = ["charcoal", "pewter_grey", "crisp_ivory"]
                accent_keys = ["powder_blue", "dusty_rose", "forest_green"]
                caution_keys = ["mustard_ochre"]
            elif undertone == "Warm":
                primary_keys = ["terracotta", "sage_green", "warm_cinnamon", "peach_blush"]
                neutral_keys = ["camel", "champagne", "espresso"]
                accent_keys = ["mustard_ochre", "burnt_orange", "royal_gold"]
                caution_keys = ["lavender_ice"]
            else:
                primary_keys = ["burgundy", "teal", "dusty_rose", "navy_blue"]
                neutral_keys = ["camel", "charcoal", "crisp_ivory"]
                accent_keys = ["sage_green", "royal_gold", "ruby_red"]
                caution_keys = ["mint_water"]

        elif skin_tone == "Medium":
            if undertone == "Cool":
                primary_keys = ["ruby_red", "royal_gold", "emerald_green", "burgundy"]
                neutral_keys = ["navy_blue", "crisp_ivory", "charcoal"]
                accent_keys = ["sapphire_blue", "rani_pink", "amethyst_plum"]
                caution_keys = ["powder_blue"]
            elif undertone == "Warm":
                primary_keys = ["emerald_green", "burgundy", "terracotta", "mustard_ochre"]
                neutral_keys = ["camel", "espresso", "champagne"]
                accent_keys = ["royal_gold", "burnt_orange", "copper_rust"]
                caution_keys = ["pewter_grey"]
            else:
                primary_keys = ["emerald_green", "burgundy", "navy_blue", "royal_gold"]
                neutral_keys = ["champagne", "charcoal", "camel"]
                accent_keys = ["teal", "marigold", "ruby_red"]
                caution_keys = ["powder_blue"]

        elif skin_tone == "Olive / Tan":
            if undertone == "Cool":
                primary_keys = ["deep_teal", "amethyst_plum", "emerald_green", "burgundy"]
                neutral_keys = ["navy_blue", "charcoal", "crisp_ivory"]
                accent_keys = ["sapphire_blue", "crimson_wine", "pewter_grey"]
                caution_keys = ["dusty_rose"]
            elif undertone == "Warm":
                primary_keys = ["terracotta", "emerald_green", "mustard_ochre", "warm_cinnamon"]
                neutral_keys = ["espresso", "camel", "royal_gold"]
                accent_keys = ["burnt_orange", "copper_rust", "marigold"]
                caution_keys = ["lavender_ice"]
            else:
                primary_keys = ["emerald_green", "burgundy", "teal", "royal_gold"]
                neutral_keys = ["crisp_ivory", "espresso", "navy_blue"]
                accent_keys = ["terracotta", "marigold", "crimson_wine"]
                caution_keys = ["powder_blue"]

        else:  # Deep
            if undertone == "Warm":
                primary_keys = ["royal_gold", "emerald_green", "marigold", "terracotta"]
                neutral_keys = ["crisp_ivory", "camel", "espresso"]
                accent_keys = ["burnt_orange", "rani_pink", "cobalt"]
                caution_keys = ["charcoal"]
            elif undertone == "Cool":
                primary_keys = ["cobalt", "ruby_red", "crisp_ivory", "amethyst_plum"]
                neutral_keys = ["pure_black", "pewter_grey", "navy_blue"]
                accent_keys = ["electric_violet", "rani_pink", "emerald_green"]
                caution_keys = ["espresso"]
            else:
                primary_keys = ["emerald_green", "royal_gold", "ruby_red", "crisp_ivory"]
                neutral_keys = ["camel", "pure_black", "champagne"]
                accent_keys = ["cobalt", "rani_pink", "marigold"]
                caution_keys = ["pewter_grey"]

        # Step 2: Contextual Dress & Occasion Modulation
        # If Traditional/Wedding & Saree/Lehenga -> prioritize rich jewel tones, zari gold, crimson
        if "wedding" in occasion_key or "festive" in occasion_key or "traditional" in occasion_key:
            if "saree" in dress_key or "lehenga" in dress_key or "kurti" in dress_key:
                primary_keys = ["emerald_green", "burgundy", "royal_gold", "rani_pink"]
                accent_keys = ["marigold", "crimson_wine", "amethyst_plum"]
            elif "gown" in dress_key:
                primary_keys = ["burgundy", "emerald_green", "sapphire_blue", "champagne"]
                accent_keys = ["royal_gold", "amethyst_plum", "crisp_ivory"]

        # If Office / Formal Wear -> prioritize refined tailored neutrals and deep classics
        elif "office" in occasion_key or "formal" in dress_key:
            if "shirt" in dress_key or "formal" in dress_key:
                primary_keys = ["navy_blue", "slate_blue", "crisp_ivory", "charcoal"]
                neutral_keys = ["camel", "pewter_grey", "espresso"]
                accent_keys = ["burgundy", "sage_green", "forest_green"]
            else:
                primary_keys = ["navy_blue", "charcoal", "forest_green", "burgundy"]
                neutral_keys = ["crisp_ivory", "camel", "pewter_grey"]
                accent_keys = ["dusty_rose", "teal", "slate_blue"]

        # If Casual / T-shirt / Casual Wear -> prioritize relaxed, natural, versatile shades
        elif "casual" in occasion_key or "casual" in dress_key or "t-shirt" in dress_key:
            primary_keys = ["sage_green", "navy_blue", "terracotta", "crisp_ivory"]
            neutral_keys = ["charcoal", "camel", "pewter_grey"]
            accent_keys = ["peach_blush", "powder_blue", "coral_sunset"]

        # If Date / Evening
        elif "date" in occasion_key or "party" in occasion_key:
            primary_keys = ["burgundy", "sapphire_blue", "amethyst_plum", "emerald_green"]
            accent_keys = ["crimson_wine", "royal_gold", "dusty_rose"]

        # Resolve objects from library
        primary_colors = [PALETTE_LIBRARY[k] for k in primary_keys if k in PALETTE_LIBRARY]
        neutral_colors = [PALETTE_LIBRARY[k] for k in neutral_keys if k in PALETTE_LIBRARY]
        accent_colors = [PALETTE_LIBRARY[k] for k in accent_keys if k in PALETTE_LIBRARY]
        caution_colors = [PALETTE_LIBRARY[k] for k in caution_keys if k in PALETTE_LIBRARY]

        # Ensure unique items
        all_recommended = primary_colors + neutral_colors[:2] + accent_colors[:2]

        # Step 3: Curate 4-Piece Outfit Combination
        hero_dress_color = primary_colors[0] if primary_colors else PALETTE_LIBRARY["emerald_green"]

        if undertone == "Cool":
            acc_key = "silver" if "wedding" not in occasion_key else "pearl"
            shoe_key = "metallic_silver" if "party" in occasion_key or "wedding" in occasion_key else "classic_black"
            bag_key = "black" if "office" in occasion_key else "champagne"
        elif undertone == "Warm":
            acc_key = "gold" if "wedding" in occasion_key or "festive" in occasion_key else "antique_brass"
            shoe_key = "metallic_gold" if "wedding" in occasion_key else "caramel"
            bag_key = "cognac" if "casual" in occasion_key else "champagne"
        else:
            acc_key = "rose_gold"
            shoe_key = "nude"
            bag_key = "beige"

        outfit_combination = {
            "dress": {
                "item": dress_type,
                "name": hero_dress_color["name"],
                "hex": hero_dress_color["hex"]
            },
            "accessories": COORDINATES["accessories"].get(acc_key, COORDINATES["accessories"]["gold"]),
            "footwear": COORDINATES["footwear"].get(shoe_key, COORDINATES["footwear"]["nude"]),
            "bag": COORDINATES["bags"].get(bag_key, COORDINATES["bags"]["beige"])
        }

        # Step 4: Craft Tailored Styling Rationale
        styling_advice = self._generate_styling_advice(
            skin_tone, undertone, dress_type, occasion, hero_dress_color["name"]
        )

        return {
            "skin_tone": skin_tone,
            "undertone": undertone,
            "dress_type": dress_type,
            "occasion": occasion,
            "recommended_colors": all_recommended,
            "palette_groups": {
                "primary_power": primary_colors,
                "harmonious_neutrals": neutral_colors,
                "statement_accents": accent_colors,
                "approach_with_care": caution_colors
            },
            "outfit_combination": outfit_combination,
            "styling_advice": styling_advice,
            "disclaimer": "These colors are suggested as complementary styling options based on digital image analysis. Personal confidence and individual expression always take precedence."
        }

    def _generate_styling_advice(
        self,
        skin_tone: str,
        undertone: str,
        dress_type: str,
        occasion: str,
        hero_color_name: str
    ) -> Dict[str, str]:
        fabric_notes = "Opt for fluid fabrics with subtle sheen such as raw silk, georgette, or mercerized cotton to enrich the color depth."
        if dress_type.lower() in ["saree", "lehenga"]:
            fabric_notes = "Rich weaves such as Banarasi, Chanderi, or Kanjivaram silk bring out the vibrancy of these curated shades with regal golden zari accents."
        elif dress_type.lower() in ["shirt", "formal wear"]:
            fabric_notes = "Crisp Egyptian cotton, linen blends, or fine wool twill anchor the structured lines of the silhouette."
        elif dress_type.lower() in ["gown"]:
            fabric_notes = "Fluid crepe, velvet, or embroidered tulle catch the ambient light and elevate the dramatic flow of the color."

        harmony_notes = (
            f"For an estimated {skin_tone} tone with {undertone.lower()} undertones, "
            f"{hero_color_name} offers a striking balance of tonal richness and contrast. "
            f"It flatters the natural complexion without overpowering facial features."
        )

        pairing_notes = (
            f"For a {occasion.lower()} setting, keep jewelry refined. "
            f"{'Warm yellow gold and champagne accents' if undertone == 'Warm' else 'Cool silver, diamond, or platinum accents'} "
            f"naturally mirror your undertone."
        )

        return {
            "harmony_rationale": harmony_notes,
            "fabric_recommendation": fabric_notes,
            "styling_tip": pairing_notes
        }


# Singleton engine instance
recommendation_engine = RecommendationEngine()
