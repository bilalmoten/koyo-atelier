/**
 * KOYO Perfume Atelier - Data Repository
 * Master formulas, accord database, olfactory pyramid roles, and ready-made fragrance oils.
 */

const ACCORDS_DATA = [
  {
    id: "fresh-citrus",
    name: "Fresh Citrus Accord",
    family: "Fresh",
    role: "TOP",
    shortDescription: "Sparkling citrus brightness; clean first impression",
    fullDescription: "A dazzling burst of sun-drenched Italian bergamot, crisp lemon zest, and juicy mandarin. Lifts the entire fragrance with an immediate energetic radiance and clarity.",
    volatility: "Fast Volatility (Sparkling Opening)",
    intensity: "Bright & Sparkling",
    recommendedPct: "15% – 25% of formula (approx. 8–15 drops)",
    pairsWith: ["Pineapple Accord", "Lotus Accord", "White Musk", "Leather Accord"],
    color: "#f59e0b",
    tags: ["Sparkling", "Clean", "Luminous", "Zesty"],
    perfumerTip: "Adds instant vitality and openness. Essential for a radiant opening spray."
  },
  {
    id: "pineapple",
    name: "Pineapple Accord",
    family: "Fruity",
    role: "TOP",
    shortDescription: "Juicy tropical fruit; playful and luminous",
    fullDescription: "Succulent, freshly sliced golden pineapple with tart exotic facets and a hint of caramelized natural sweetness. Brings modern vibrant optimism.",
    volatility: "Fast Volatility (Tropical Lift)",
    intensity: "Bright & Tropical",
    recommendedPct: "15% – 25% of formula (approx. 8–15 drops)",
    pairsWith: ["Black Currant Accord", "Fresh Citrus Accord", "Galaxolide", "Leather Accord"],
    color: "#eab308",
    tags: ["Juicy", "Tropical", "Playful", "Modern"],
    perfumerTip: "The signature secret behind iconic luxury niche scents. Blends magnificently with leather and musks."
  },
  {
    id: "black-currant",
    name: "Black Currant Accord",
    family: "Fruity",
    role: "TOP/HEART",
    shortDescription: "Tart berry fruit; bold, modern lift",
    fullDescription: "Deep, purple-tinted cassis berries with crisp green leafy undertones and a tangy, mouthwatering contrast. Bridges the fleeting top into the floral/woody core.",
    volatility: "Medium Volatility (Transition Note)",
    intensity: "Rich & Tart",
    recommendedPct: "10% – 18% of formula (approx. 5–10 drops)",
    pairsWith: ["Pineapple Accord", "White Floral Accord", "Rose Honey Accord", "White Musk"],
    color: "#8b5cf6",
    tags: ["Tart", "Bold", "Cassis", "Sophisticated"],
    perfumerTip: "Gives a bold contemporary edge. A few drops prevent sweet florals from feeling too powdery."
  },
  {
    id: "lotus",
    name: "Lotus Accord",
    family: "Floral",
    role: "HEART",
    shortDescription: "Watery soft floral; airy, elegant and delicate",
    fullDescription: "Dewy lotus blossoms floating over clear morning spring water. Translucent, calming, poetic, and pristine with gentle green petal nuances.",
    volatility: "Medium Volatility (Airy Body)",
    intensity: "Delicate & Airy",
    recommendedPct: "15% – 25% of formula (approx. 8–15 drops)",
    pairsWith: ["White Floral Accord", "Fresh Citrus Accord", "White Musk", "Galaxolide"],
    color: "#06b6d4",
    tags: ["Watery", "Airy", "Serene", "Delicate"],
    perfumerTip: "Creates a dreamy, modern aquatic-floral breeze without heavy sweetness."
  },
  {
    id: "white-floral",
    name: "White Floral Accord",
    family: "Floral",
    role: "HEART",
    shortDescription: "Creamy floral body; polished and feminine",
    fullDescription: "A lush, velvety bouquet of gardenia, night-blooming jasmine, and white tuberose petals. Silky, opulent, captivating, and timelessly elegant.",
    volatility: "Medium–Long Tenacity (Opulent Body)",
    intensity: "Opulent & Polished",
    recommendedPct: "18% – 30% of formula (approx. 10–18 drops)",
    pairsWith: ["Rose Honey Accord", "Lotus Accord", "Marshmallow", "Galaxolide"],
    color: "#ec4899",
    tags: ["Creamy", "Opulent", "Polished", "Velvety"],
    perfumerTip: "The heart and soul of fine perfumery. Provides luxurious body and captivating sillage."
  },
  {
    id: "rose-honey",
    name: "Rose Honey Accord",
    family: "Floral/Sweet",
    role: "HEART",
    shortDescription: "Soft rose with honeyed warmth and sweetness",
    fullDescription: "Velvety Damask rose petals drizzled with golden artisanal acacia honey and warm morning nectar. Romantic, sensual, and invitingly cozy.",
    volatility: "Medium–Long Tenacity (Sensual Core)",
    intensity: "Sensual & Honeyed",
    recommendedPct: "12% – 22% of formula (approx. 6–12 drops)",
    pairsWith: ["White Floral Accord", "Gourmand Accord", "Marshmallow", "Tobacco Accord"],
    color: "#f43f5e",
    tags: ["Romantic", "Honeyed", "Warm", "Sensual"],
    perfumerTip: "Pairs divinely with White Floral and Gourmand to create an irresistible romantic warmth."
  },
  {
    id: "gourmand",
    name: "Gourmand Accord",
    family: "Sweet",
    role: "HEART/BASE",
    shortDescription: "Dessert-like sweetness; cozy, edible and round",
    fullDescription: "Warm caramelized sugar, roasted praline, velvety vanilla bean, and toasted hazelnut cream. Irresistibly comforting, indulgent, and addictive.",
    volatility: "Long Tenacity (Deep Warmth)",
    intensity: "Warm & Round",
    recommendedPct: "8% – 18% of formula (approx. 4–10 drops)",
    pairsWith: ["Marshmallow", "Rose Honey Accord", "Tobacco Accord", "White Musk"],
    color: "#d97706",
    tags: ["Cozy", "Edible", "Praline", "Indulgent"],
    perfumerTip: "Use with a measured hand for a sophisticated cozy halo, or increase for a decadent signature."
  },
  {
    id: "marshmallow",
    name: "Marshmallow",
    family: "Sweet",
    role: "HEART/BASE",
    shortDescription: "Powdery fluffy sweetness; soft and playful",
    fullDescription: "Airy spun sugar confection dusted with delicate powdered vanilla and soft white blossom musk. Fluffy, nostalgic, sweet, and comforting.",
    volatility: "Long Tenacity (Velvet Cloud)",
    intensity: "Soft & Powdery",
    recommendedPct: "10% – 20% of formula (approx. 5–12 drops)",
    pairsWith: ["White Floral Accord", "Rose Honey Accord", "Gourmand Accord", "White Musk"],
    color: "#f472b6",
    tags: ["Fluffy", "Powdery", "Playful", "Sweet"],
    perfumerTip: "Smoothens sharp edges in citrus or spicy accords, giving the blend a soft cloud-like aura."
  },
  {
    id: "white-musk",
    name: "White Musk",
    family: "Clean Musk",
    role: "BASE",
    shortDescription: "Clean skin-like softness; smooth and wearable",
    fullDescription: "Pristine sun-dried white linen, freshly laundered cotton, and warm intimate skin. The ultimate clean, universally flattering everyday signature.",
    volatility: "Long Tenacity (Second-Skin Sillage)",
    intensity: "Intimate & Clean",
    recommendedPct: "15% – 30% of formula (approx. 8–18 drops)",
    pairsWith: ["Galaxolide", "Ethylene Brassylate", "Fresh Citrus Accord", "Lotus Accord"],
    color: "#94a3b8",
    tags: ["Clean", "Skin-Scent", "Smooth", "Modern"],
    perfumerTip: "Acts as the foundation for your fragrance. Unifies all notes into a cohesive luxury blend."
  },
  {
    id: "galaxolide",
    name: "Galaxolide",
    family: "Musk",
    role: "BASE",
    shortDescription: "Diffusive clean musk; adds softness and volume",
    fullDescription: "A renowned master-perfumer musk that imparts remarkable radiant projection, sweet-floral floralcy, and a soft velvety aura that fills the room.",
    volatility: "Ultra-Long Tenacity (Diffusive Volume)",
    intensity: "Radiant & Diffusive",
    recommendedPct: "12% – 25% of formula (approx. 6–15 drops)",
    pairsWith: ["White Musk", "Ethylene Brassylate", "Pineapple Accord", "White Floral Accord"],
    color: "#a855f7",
    tags: ["Radiant", "Diffusive", "Volume", "Velvety"],
    perfumerTip: "Adds immense sillage and space between notes. Essential for making your perfume project effortlessly."
  },
  {
    id: "ethylene-brassylate",
    name: "Ethylene Brassylate",
    family: "Musk",
    role: "BASE",
    shortDescription: "Smooth elegant musk; helps longevity",
    fullDescription: "A sophisticated macrocyclic musk with subtle sweet-woody and soft ambrette undertones. Provides unmatched fixative power and lasting skin persistence.",
    volatility: "Ultra-Long Tenacity (Master Fixative)",
    intensity: "Smooth Fixative",
    recommendedPct: "12% – 25% of formula (approx. 6–15 drops)",
    pairsWith: ["White Musk", "Galaxolide", "Leather Accord", "Tobacco Accord"],
    color: "#6366f1",
    tags: ["Fixative", "Elegant", "Longevity", "Tenacious"],
    perfumerTip: "The ultimate natural-feeling fixative. Anchors top and heart notes so they don't evaporate prematurely."
  },
  {
    id: "leather",
    name: "Leather Accord",
    family: "Deep",
    role: "BASE",
    shortDescription: "Dry, textured depth; bold and sophisticated",
    fullDescription: "Supple tanned saddle leather, birch tar smoke, and refined suede warmth. Imparts unmistakable confidence, luxury, and daring depth.",
    volatility: "Long Tenacity (Smoky Texture)",
    intensity: "Bold & Textured",
    recommendedPct: "4% – 10% of formula (approx. 2–6 drops)",
    pairsWith: ["Pineapple Accord", "Fresh Citrus Accord", "Tobacco Accord", "Ethylene Brassylate"],
    color: "#78350f",
    tags: ["Textured", "Bold", "Smoky", "Haute"],
    perfumerTip: "Highly potent! 2–4 drops add masculine confidence and niche depth without overpowering."
  },
  {
    id: "tobacco",
    name: "Tobacco Accord",
    family: "Warm",
    role: "BASE",
    shortDescription: "Warm smoky sweetness; rich and sensual",
    fullDescription: "Sun-cured golden Virginia tobacco leaf laced with roasted honey, dry tonka bean, and sweet amber smoke. Intoxicating, opulent, and magnetic.",
    volatility: "Long Tenacity (Sensual Sillage)",
    intensity: "Rich & Sensual",
    recommendedPct: "4% – 12% of formula (approx. 2–8 drops)",
    pairsWith: ["Rose Honey Accord", "Gourmand Accord", "Leather Accord", "White Musk"],
    color: "#92400e",
    tags: ["Smoky", "Opulent", "Sensual", "Warm"],
    perfumerTip: "Brings mysterious evening warmth and magnetic intimacy when combined with vanilla or rose honey."
  }
];

const READY_MADE_OILS = [
  {
    id: "gucci-flora",
    title: "Gucci Flora",
    badge: "Premixed Ready Perfume Oil",
    profileCategory: "Floral & Fruity Glow",
    tagline: "Radiant, feminine bouquet of white gardenia, jasmine & sparkling pear",
    notes: {
      top: "Pear Blossom, Italian Mandarin, Red Berries",
      heart: "White Gardenia, Jasmine Grandiflorum, Frangipani",
      base: "Brown Sugar Accord, Indonesian Patchouli, Clean Musks"
    },
    description: "A joyful floral signature crafted around the radiant Gardenia blossom, admired for its luminous allure and velvety sensual sillage.",
    idealBoosters: [
      { id: "white-musk", label: "+ White Musk (Soft Skin Glow)" },
      { id: "fresh-citrus", label: "+ Fresh Citrus (Crisp Sparkle)" },
      { id: "marshmallow", label: "+ Marshmallow (Fluffy Sweetness)" }
    ]
  },
  {
    id: "dior-sauvage-elixir",
    title: "Dior Sauvage Elixir",
    badge: "Premixed Ready Perfume Oil",
    profileCategory: "Ultra-Concentrated Spicy Woods",
    tagline: "Bold, nocturnal elixir of intoxicating spices, lavender essence & rich woods",
    notes: {
      top: "Nutmeg, Cinnamon, Cardamom, Zesty Grapefruit",
      heart: "Custom Lavender Essence, Coumarin",
      base: "Licorice, Sandalwood, Haitian Vetiver, Rich Amber"
    },
    description: "An extraordinarily potent, nocturnal composition steeped in signature Sauvage freshness with an intoxicating spicy heart and a dense woody base.",
    idealBoosters: [
      { id: "pineapple", label: "+ Pineapple Accord (Aventus Fusion)" },
      { id: "leather", label: "+ Leather Accord (Darker Depth)" },
      { id: "galaxolide", label: "+ Galaxolide (Huge Projection)" }
    ]
  },
  {
    id: "jpg-ultra-male",
    title: "JPG Ultra Male",
    badge: "Premixed Ready Perfume Oil",
    profileCategory: "Sweet Spicy Gourmand Seduction",
    tagline: "Irresistible magnetic contrast of juicy black pear, spicy cinnamon & dark vanilla",
    notes: {
      top: "Juicy Pear, Black Lavender, Mint, Bergamot, Lemon",
      heart: "Cinnamon, Caraway, Clary Sage",
      base: "Black Vanilla Husk, Amber, Cedarwood, Patchouli"
    },
    description: "An intoxicating oriental gourmand designed for magnetic evening presence. Sweet, bold, deliciously addictive with unrivaled trail.",
    idealBoosters: [
      { id: "gourmand", label: "+ Gourmand Accord (Extra Vanilla/Praline)" },
      { id: "fresh-citrus", label: "+ Fresh Citrus (Fresh Zest Lift)" },
      { id: "tobacco", label: "+ Tobacco Accord (Smoky Contrast)" }
    ]
  },
  {
    id: "dior-blooming-bouquet",
    title: "Dior Blooming Bouquet",
    badge: "Premixed Ready Perfume Oil",
    profileCategory: "Sparkling Tender Floral",
    tagline: "Delicate couture dress of thousands of fresh peonies, Damask rose & white musks",
    notes: {
      top: "Calabrian Bergamot, Sweet Pea",
      heart: "Pink Peony, Damask Rose, Apricot, Peach",
      base: "Lacy White Musk, Soft Cashmeran"
    },
    description: "A delicate, romantic embrace of freshly blossomed peonies and soft roses faceted by the sparkle of Calabrian bergamot and enveloped in a lacy musk veil.",
    idealBoosters: [
      { id: "lotus", label: "+ Lotus Accord (Airy Aquatic Glow)" },
      { id: "white-musk", label: "+ White Musk (Clean Powder)" },
      { id: "rose-honey", label: "+ Rose Honey (Deeper Nectar)" }
    ]
  }
];

const STARTING_PRESETS = [
  {
    id: "fresh-fruity-woods",
    title: "Fresh Fruity Woods",
    tagline: "Bold pineapple, crisp citrus, clean musks & subtle smoky leather",
    category: "custom_accord",
    defaultConcentration: "balanced",
    description: "A charismatic modern archetype. Opens with sparkling citrus and pineapple, layered over tart blackcurrant, anchored by clean diffusive musks and a hint of smoky leather.",
    drops: {
      "fresh-citrus": 12,
      "pineapple": 14,
      "black-currant": 8,
      "white-musk": 8,
      "galaxolide": 8,
      "ethylene-brassylate": 6,
      "leather": 2,
      "tobacco": 2
    }
  },
  {
    id: "soft-floral-musk",
    title: "Soft Floral Musk",
    tagline: "Dewy lotus, opulent white petals, rose honey & soft marshmallow cloud",
    category: "custom_accord",
    defaultConcentration: "balanced",
    description: "An enchanting bouquet of dewy lotus and opulent white florals kissed by rose honey and fluffy marshmallow, floating on a luminous clean musk cloud.",
    drops: {
      "fresh-citrus": 6,
      "pineapple": 6,
      "black-currant": 4,
      "lotus": 10,
      "white-floral": 12,
      "rose-honey": 8,
      "marshmallow": 6,
      "white-musk": 5,
      "galaxolide": 3
    }
  },
  {
    id: "golden-amber-gourmand",
    title: "Golden Amber Gourmand",
    tagline: "Warm honeyed rose, praline dessert sweetness, tobacco smoke & velvet musks",
    category: "custom_accord",
    defaultConcentration: "intense",
    description: "An indulgent evening blend of roasted gourmand praline, honeyed rose, and fluffy marshmallow enriched by warm tobacco and enduring ethical musks.",
    drops: {
      "fresh-citrus": 4,
      "rose-honey": 14,
      "gourmand": 12,
      "marshmallow": 10,
      "tobacco": 6,
      "white-musk": 6,
      "ethylene-brassylate": 8
    }
  },
  {
    id: "velvet-skin-musk",
    title: "Velvet Skin Musk",
    tagline: "Understated intimacy, soft clean halo & room-filling skin-scent sillage",
    category: "custom_accord",
    defaultConcentration: "airy",
    description: "For the minimalist purist. An intimate, diffusive aura of pure Galaxolide, White Musk, and Ethylene Brassylate with a subtle dewy lotus touch.",
    drops: {
      "fresh-citrus": 6,
      "lotus": 6,
      "white-musk": 18,
      "galaxolide": 16,
      "ethylene-brassylate": 14
    }
  }
];

const CONCENTRATION_PROFILES = [
  {
    id: "airy",
    name: "Airy & Diffusive",
    subtitle: "High Sillage & Lift",
    description: "Bright, radiant scent cloud that dances off skin. Sparkling and fresh for everyday wear.",
    targetDrops: 40,
    oilConcentration: "20%",
    oilVolume: "2.0 mL",
    ethanolVolume: "8.0 mL",
    presenceFeel: "High Sillage / Diffusive",
    badge: "Eau de Parfum (20%)"
  },
  {
    id: "balanced",
    name: "Signature Balance",
    subtitle: "All-Day Presence",
    description: "The master perfumer's golden ratio. Harmonious blend of radiant projection and all-day presence.",
    targetDrops: 60,
    oilConcentration: "30%",
    oilVolume: "3.0 mL",
    ethanolVolume: "7.0 mL",
    presenceFeel: "Balanced / Radiant & Lasting",
    badge: "Extrait de Parfum (30%)"
  },
  {
    id: "intense",
    name: "Intense & Intimate",
    subtitle: "Pure Extrait Trail",
    description: "Ultra-concentrated luxury. Rich velvety texture with deep magnetic trail that lingers on skin.",
    targetDrops: 80,
    oilConcentration: "40%",
    oilVolume: "4.0 mL",
    ethanolVolume: "6.0 mL",
    presenceFeel: "Deep & Intimate Trail",
    badge: "Parfum Intense (40%)"
  }
];
