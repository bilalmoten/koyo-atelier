/**
 * KOYO Perfume Atelier - Data Repository (10ml Pure Perfume Oil Edition)
 * Master formulas, 17-accord database, single-category olfactory pyramid, and ready-made oils.
 * OIL ONLY Workshop: No ethanol / alcohol. Pure fragrance oils measured in drops and grams.
 */

const ACCORDS_DATA = [
  // ==========================================
  // TOP NOTES (3)
  // ==========================================
  {
    id: "fresh-citrus",
    name: "Fresh Citrus Accord",
    family: "Fresh / Citrus",
    role: "TOP",
    roleLabel: "TOP NOTE",
    shortDescription: "Sparkling citrus brightness; clean first impression",
    fullDescription: "A dazzling burst of sun-drenched Italian bergamot, crisp lemon zest, and juicy mandarin. Lifts the fragrance with an immediate energetic radiance and luminous clarity.",
    volatility: "Fast Volatility (Opening Burst)",
    intensity: "Bright & Sparkling",
    recommendedPct: "15% – 25% (approx. 15–25 drops / 0.5–0.9g)",
    pairsWith: ["Pineapple Accord", "Black Currant Accord", "Hedione", "Iso E Super", "White Musk"],
    color: "#f59e0b",
    tags: ["Sparkling", "Bergamot", "Zesty", "Luminous"],
    perfumerTip: "Adds instant vitality and openness. Essential for an uplifting first impression on skin.",
    densityGramsPerDrop: 0.035
  },
  {
    id: "pineapple",
    name: "Pineapple Accord",
    family: "Fruity / Tropical",
    role: "TOP",
    roleLabel: "TOP NOTE",
    shortDescription: "Juicy tropical fruit; playful, bright and luminous",
    fullDescription: "Succulent, freshly sliced golden pineapple with tart exotic facets and a hint of caramelized natural sweetness. Brings modern vibrant optimism and juicy radiance.",
    volatility: "Fast Volatility (Tropical Lift)",
    intensity: "Bright & Tropical",
    recommendedPct: "15% – 25% (approx. 15–25 drops / 0.5–0.9g)",
    pairsWith: ["Black Currant Accord", "Fresh Citrus Accord", "Leather Accord", "Galaxolide", "Iso E Super"],
    color: "#eab308",
    tags: ["Juicy", "Tropical", "Playful", "Modern"],
    perfumerTip: "The iconic secret behind legendary modern luxury scents. Blends magnificently with Leather and Iso E Super.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "black-currant",
    name: "Black Currant Accord",
    family: "Fruity / Berry",
    role: "TOP",
    roleLabel: "TOP NOTE",
    shortDescription: "Tart dark berry fruit; bold, modern punch",
    fullDescription: "Deep, purple-tinted cassis berries with crisp green leafy undertones and a tangy, mouthwatering contrast. Imparts an assertive, sophisticated fruit opening.",
    volatility: "Fast–Medium Volatility (Vibrant Punch)",
    intensity: "Rich & Tart",
    recommendedPct: "10% – 20% (approx. 10–20 drops / 0.35–0.7g)",
    pairsWith: ["Pineapple Accord", "Rose Honey Accord", "White Floral Accord", "Oud Accord", "White Musk"],
    color: "#a855f7",
    tags: ["Tart", "Bold", "Cassis", "Sophisticated"],
    perfumerTip: "Gives a bold contemporary edge. A few drops prevent sweet florals or rich vanillas from feeling flat.",
    densityGramsPerDrop: 0.035
  },

  // ==========================================
  // HEART NOTES (5)
  // ==========================================
  {
    id: "lotus",
    name: "Lotus Accord",
    family: "Floral / Aquatic",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Watery soft floral; airy, elegant and delicate",
    fullDescription: "Dewy lotus blossoms floating over clear morning spring water. Translucent, calming, poetic, and pristine with gentle green petal nuances and serene aquatic softness.",
    volatility: "Medium Volatility (Airy Floral Body)",
    intensity: "Delicate & Airy",
    recommendedPct: "12% – 22% (approx. 12–22 drops / 0.4–0.8g)",
    pairsWith: ["White Floral Accord", "Fresh Citrus Accord", "Hedione", "White Musk", "Galaxolide"],
    color: "#06b6d4",
    tags: ["Watery", "Airy", "Serene", "Delicate"],
    perfumerTip: "Creates a dreamy, modern aquatic-floral breeze. Opens up dense heavy formulas.",
    densityGramsPerDrop: 0.035
  },
  {
    id: "white-floral",
    name: "White Floral Accord",
    family: "Floral",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Creamy floral body; polished and opulent",
    fullDescription: "A lush, velvety bouquet of gardenia, night-blooming jasmine, and white tuberose petals. Silky, opulent, captivating, and timelessly elegant fine fragrance heart.",
    volatility: "Medium–Long Tenacity (Opulent Body)",
    intensity: "Opulent & Polished",
    recommendedPct: "15% – 25% (approx. 15–25 drops / 0.5–0.9g)",
    pairsWith: ["Rose Honey Accord", "Lotus Accord", "Hedione", "Marshmallow Accord", "Vanilla Accord"],
    color: "#ec4899",
    tags: ["Creamy", "Opulent", "Jasmine", "Velvety"],
    perfumerTip: "The heart and soul of classic fine perfumery. Imparts magnificent sillage and creamy luxury body.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "rose-honey",
    name: "Rose Honey Accord",
    family: "Floral / Sweet",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Velvety Damask rose with golden acacia honeyed warmth",
    fullDescription: "Rich Damask rose petals drizzled with golden artisanal acacia honey and warm morning floral nectar. Deeply romantic, sensual, warm, and invitingly cozy.",
    volatility: "Medium–Long Tenacity (Sensual Core)",
    intensity: "Sensual & Honeyed",
    recommendedPct: "10% – 20% (approx. 10–20 drops / 0.35–0.7g)",
    pairsWith: ["White Floral Accord", "Vanilla Accord", "Tobacco Accord", "Oud Accord", "Marshmallow Accord"],
    color: "#f43f5e",
    tags: ["Romantic", "Honeyed", "Warm", "Sensual"],
    perfumerTip: "Pairs divinely with Tobacco and Oud to create irresistible Eastern-niche warmth and magnetic intimacy.",
    densityGramsPerDrop: 0.037
  },
  {
    id: "hedione",
    name: "Hedione",
    family: "Transparent Floral / Booster",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Luminous transparent jasmine booster & diffusion enhancer",
    fullDescription: "The legendary aroma chemical that revolutionized luxury perfumery (Eau Sauvage). Imparts radiant floral airiness, dew-like morning transparency, and expands all surrounding notes effortlessly.",
    volatility: "Medium–Long Tenacity (Radiant Diffuser)",
    intensity: "Transparent & Diffusive",
    recommendedPct: "10% – 20% (approx. 10–20 drops / 0.35–0.7g)",
    pairsWith: ["Fresh Citrus Accord", "Iso E Super", "White Floral Accord", "Lotus Accord", "Galaxolide"],
    color: "#38bdf8",
    tags: ["Radiant", "Booster", "Transparent", "Diffusion"],
    perfumerTip: "The master perfumer's secret weapon. It breathes air and radiance into heavy oils, giving roll-on oil incredible projection.",
    densityGramsPerDrop: 0.035
  },
  {
    id: "marshmallow",
    name: "Marshmallow Accord",
    family: "Sweet / Confectionery",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Powdery fluffy sweetness; soft, playful and nostalgic",
    fullDescription: "Airy spun sugar confection dusted with delicate powdered vanilla and soft white blossom sugar. Fluffy, nostalgic, sweet, and comforting cloud-like heart texture.",
    volatility: "Medium–Long Tenacity (Velvet Cloud)",
    intensity: "Soft & Powdery",
    recommendedPct: "8% – 18% (approx. 8–18 drops / 0.3–0.6g)",
    pairsWith: ["White Floral Accord", "Rose Honey Accord", "Gourmand Accord", "Vanilla Accord", "White Musk"],
    color: "#f472b6",
    tags: ["Fluffy", "Powdery", "Playful", "Sweet"],
    perfumerTip: "Smoothens sharp edges in citrus or spicy accords, giving the blend a soft comforting aura.",
    densityGramsPerDrop: 0.035
  },

  // ==========================================
  // BASE NOTES (9)
  // ==========================================
  {
    id: "gourmand",
    name: "Gourmand Accord",
    family: "Sweet / Warm",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Warm caramelized sugar, roasted praline and hazelnut cream",
    fullDescription: "Decadent caramelized sugar, roasted praline, velvety vanilla bean, and toasted hazelnut cream. Irresistibly comforting, indulgent, and addictive evening anchor.",
    volatility: "Long Tenacity (Deep Warmth)",
    intensity: "Warm & Round",
    recommendedPct: "8% – 18% (approx. 8–18 drops / 0.3–0.6g)",
    pairsWith: ["Marshmallow Accord", "Vanilla Accord", "Tobacco Accord", "Oud Accord", "White Musk"],
    color: "#d97706",
    tags: ["Cozy", "Edible", "Praline", "Indulgent"],
    perfumerTip: "Use with a measured hand for a sophisticated cozy halo, or increase for a decadent edible signature.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "vanilla",
    name: "Vanilla Accord",
    family: "Warm Sweet / Gourmand",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Creamy bourbon vanilla bean, rich comforting anchor",
    fullDescription: "Pure Madagascar bourbon vanilla bean infused with creamy amber and smooth woody undertones. Universal, sensual, comforting, and deeply addictive drydown warmth.",
    volatility: "Long Tenacity (Sensual Anchor)",
    intensity: "Rich & Comforting",
    recommendedPct: "10% – 20% (approx. 10–20 drops / 0.35–0.7g)",
    pairsWith: ["Tobacco Accord", "Oud Accord", "Rose Honey Accord", "Gourmand Accord", "Iso E Super"],
    color: "#b45309",
    tags: ["Bourbon", "Creamy", "Sensual", "Addictive"],
    perfumerTip: "Unifies woody and floral accords into a smooth, seamless texture. Balances dark smoke and leather effortlessly.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "iso-e-super",
    name: "Iso E Super",
    family: "Woody / Ambergris",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Velvety cedarwood & ambergris aura; modern pheromone radiance",
    fullDescription: "The iconic molecule behind Molecule 01. A smooth, expanding cedarwood-ambergris aura that feels transparent, magnetic, and second-skin. Blends into human body warmth.",
    volatility: "Ultra-Long Tenacity (Expanding Halo)",
    intensity: "Subtle & Magnetic",
    recommendedPct: "15% – 30% (approx. 15–30 drops / 0.5–1.0g)",
    pairsWith: ["Hedione", "Oud Accord", "Pineapple Accord", "White Musk", "Galaxolide"],
    color: "#64748b",
    tags: ["Velvety", "Cedarwood", "Molecule", "Pheromonic"],
    perfumerTip: "Creates that elusive, compliment-pulling aura. People smell it around you even when you think it has faded.",
    densityGramsPerDrop: 0.035
  },
  {
    id: "white-musk",
    name: "White Musk",
    family: "Clean Musk",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Clean skin-like softness; smooth, intimate and wearable",
    fullDescription: "Pristine sun-dried white linen, freshly laundered cotton, and warm intimate skin. The ultimate clean, universally flattering everyday signature anchor.",
    volatility: "Long Tenacity (Second-Skin Sillage)",
    intensity: "Intimate & Clean",
    recommendedPct: "15% – 25% (approx. 15–25 drops / 0.5–0.9g)",
    pairsWith: ["Galaxolide", "Ethylene Brassylate", "Lotus Accord", "Iso E Super", "Vanilla Accord"],
    color: "#94a3b8",
    tags: ["Clean", "Skin-Scent", "Smooth", "Modern"],
    perfumerTip: "Acts as the foundation for your fragrance oil. Melts accords together and prevents clashing notes.",
    densityGramsPerDrop: 0.035
  },
  {
    id: "galaxolide",
    name: "Galaxolide",
    family: "Clean Floral Musk",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Diffusive clean musk; adds room-filling softness and volume",
    fullDescription: "A renowned master-perfumer musk that imparts remarkable radiant projection, sweet-floral floralcy, and a soft velvety aura that extends oil presence.",
    volatility: "Ultra-Long Tenacity (Diffusive Volume)",
    intensity: "Radiant & Diffusive",
    recommendedPct: "10% – 20% (approx. 10–20 drops / 0.35–0.7g)",
    pairsWith: ["White Musk", "Ethylene Brassylate", "Pineapple Accord", "White Floral Accord", "Hedione"],
    color: "#818cf8",
    tags: ["Radiant", "Diffusive", "Volume", "Velvety"],
    perfumerTip: "Adds immense sillage and space between notes. Essential for making your perfume oil project effortlessly.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "ethylene-brassylate",
    name: "Ethylene Brassylate",
    family: "Sweet Macrocyclic Musk",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Smooth elegant musk; master fixative that extends drydown",
    fullDescription: "A sophisticated macrocyclic musk with subtle sweet-woody and soft ambrette undertones. Provides unmatched fixative power and lasting skin persistence in oil blends.",
    volatility: "Ultra-Long Tenacity (Master Fixative)",
    intensity: "Smooth Fixative",
    recommendedPct: "10% – 20% (approx. 10–20 drops / 0.35–0.7g)",
    pairsWith: ["White Musk", "Galaxolide", "Leather Accord", "Tobacco Accord", "Oud Accord"],
    color: "#6366f1",
    tags: ["Fixative", "Elegant", "Longevity", "Tenacious"],
    perfumerTip: "The ultimate natural-feeling fixative. Anchors top notes so they don't disappear after the opening.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "leather",
    name: "Leather Accord",
    family: "Dark / Leather",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Dry, textured suede depth; bold and sophisticated",
    fullDescription: "Supple tanned saddle leather, birch tar smoke, and refined suede warmth. Imparts unmistakable confidence, luxury, and daring depth to pure oil blends.",
    volatility: "Long Tenacity (Smoky Texture)",
    intensity: "Bold & Textured",
    recommendedPct: "3% – 8% (approx. 3–8 drops / 0.1–0.3g)",
    pairsWith: ["Pineapple Accord", "Fresh Citrus Accord", "Tobacco Accord", "Oud Accord", "Iso E Super"],
    color: "#78350f",
    tags: ["Textured", "Bold", "Smoky", "Haute"],
    perfumerTip: "Highly potent! 3–6 drops add masculine confidence and niche depth without dominating the formula.",
    densityGramsPerDrop: 0.037
  },
  {
    id: "tobacco",
    name: "Tobacco Accord",
    family: "Warm / Smoky",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Warm smoky sweet blonde tobacco leaves; rich and sensual",
    fullDescription: "Sun-cured golden Virginia tobacco leaf laced with roasted honey, dry tonka bean, and sweet amber smoke. Intoxicating, opulent, and magnetic evening warmth.",
    volatility: "Long Tenacity (Sensual Sillage)",
    intensity: "Rich & Sensual",
    recommendedPct: "5% – 12% (approx. 5–12 drops / 0.2–0.45g)",
    pairsWith: ["Vanilla Accord", "Rose Honey Accord", "Oud Accord", "Gourmand Accord", "Leather Accord"],
    color: "#92400e",
    tags: ["Smoky", "Opulent", "Sensual", "Warm"],
    perfumerTip: "Brings mysterious evening warmth and magnetic intimacy when combined with vanilla or rose honey.",
    densityGramsPerDrop: 0.036
  },
  {
    id: "oud",
    name: "Oud Accord",
    family: "Woody / Oriental",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Deep resinous oriental agarwood; dark luxury backbone",
    fullDescription: "Regal agarwood resin enriched with smoky balsamic woods, warm saffron undertones, and velvet amber. The pinnacle of Eastern haute parfumerie prestige.",
    volatility: "Ultra-Long Tenacity (Regal Sillage)",
    intensity: "Deep & Majestic",
    recommendedPct: "4% – 12% (approx. 4–12 drops / 0.15–0.45g)",
    pairsWith: ["Rose Honey Accord", "Vanilla Accord", "Tobacco Accord", "Iso E Super", "Black Currant Accord"],
    color: "#451a03",
    tags: ["Agarwood", "Majestic", "Resinous", "Prestige"],
    perfumerTip: "A few drops give any perfume oil an instantly expensive, regal niche aura. Blends majestically with Rose Honey and Vanilla.",
    densityGramsPerDrop: 0.037
  }
];

// ==========================================
// 4 PREMIXED READY-MADE PERFUME OILS
// ==========================================
const READY_MADE_OILS = [
  {
    id: "gucci-flora",
    title: "Gucci Flora",
    badge: "Premixed 100% Perfume Oil",
    profileCategory: "Floral & Fruity Glow",
    tagline: "Radiant, feminine bouquet of white gardenia, jasmine & sparkling pear",
    notes: {
      top: "Pear Blossom, Italian Mandarin, Red Berries",
      heart: "White Gardenia, Jasmine Grandiflorum, Frangipani",
      base: "Brown Sugar Accord, Indonesian Patchouli, Clean Musks"
    },
    description: "A joyful floral signature crafted around the radiant Gardenia blossom, admired for its luminous allure and velvety sensual sillage in roll-on format.",
    idealBoosters: [
      { id: "white-musk", label: "+ White Musk (Soft Clean Skin Glow)" },
      { id: "hedione", label: "+ Hedione (Luminous Projection)" },
      { id: "marshmallow", label: "+ Marshmallow (Fluffy Sweetness)" }
    ]
  },
  {
    id: "dior-sauvage-elixir",
    title: "Dior Sauvage Elixir",
    badge: "Premixed 100% Perfume Oil",
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
      { id: "leather", label: "+ Leather Accord (Darker Suede Depth)" },
      { id: "oud", label: "+ Oud Accord (Regal Oriental Twist)" }
    ]
  },
  {
    id: "jpg-ultra-male",
    title: "JPG Ultra Male",
    badge: "Premixed 100% Perfume Oil",
    profileCategory: "Sweet Spicy Gourmand Seduction",
    tagline: "Irresistible magnetic contrast of juicy black pear, spicy cinnamon & dark vanilla",
    notes: {
      top: "Juicy Pear, Black Lavender, Mint, Bergamot, Lemon",
      heart: "Cinnamon, Caraway, Clary Sage",
      base: "Black Vanilla Husk, Amber, Cedarwood, Patchouli"
    },
    description: "An intoxicating oriental gourmand designed for magnetic evening presence. Sweet, bold, deliciously addictive with unrivaled roll-on trail.",
    idealBoosters: [
      { id: "vanilla", label: "+ Vanilla Accord (Rich Bourbon Density)" },
      { id: "tobacco", label: "+ Tobacco Accord (Smoky Contrast)" },
      { id: "fresh-citrus", label: "+ Fresh Citrus (Crisp Sparkle)" }
    ]
  },
  {
    id: "dior-blooming-bouquet",
    title: "Dior Blooming Bouquet",
    badge: "Premixed 100% Perfume Oil",
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
      { id: "hedione", label: "+ Hedione (Dewy Airiness)" },
      { id: "rose-honey", label: "+ Rose Honey (Deeper Nectar)" }
    ]
  }
];

// ==========================================
// BESPOKE OIL FORMULATION STARTING PRESETS (9.60 g / 10.0 mL Total)
// ==========================================
const STARTING_PRESETS = [
  {
    id: "royal-oud-vanilla",
    title: "Royal Oud & Smoked Vanilla",
    tagline: "Regal agarwood, bourbon vanilla, honeyed tobacco & velvety Iso E Super",
    category: "custom_accord",
    defaultTarget: 9.60,
    description: "A rich, regal Middle Eastern niche signature. Balances deep dark agarwood resin with luscious bourbon vanilla and warm honeyed tobacco, softened by Iso E Super.",
    amounts: {
      "black-currant": 0.96,
      "fresh-citrus": 0.77,
      "rose-honey": 1.15,
      "hedione": 0.96,
      "vanilla": 1.73,
      "tobacco": 1.15,
      "oud": 0.96,
      "iso-e-super": 1.15,
      "ethylene-brassylate": 0.77
    },
    drops: {
      "black-currant": 32,
      "fresh-citrus": 26,
      "rose-honey": 38,
      "hedione": 32,
      "vanilla": 58,
      "tobacco": 38,
      "oud": 32,
      "iso-e-super": 38,
      "ethylene-brassylate": 26
    }
  },
  {
    id: "aventus-suede-pineapple",
    title: "Solar Pineapple & Tuscan Suede",
    tagline: "Vibrant golden pineapple, sparkling citrus, dry textured leather & diffusive musks",
    category: "custom_accord",
    defaultTarget: 9.60,
    description: "A charismatic, masculine-leaning modern luxury profile. Juicy tropical pineapple and bergamot meet confident dark suede leather, amplified by Galaxolide and Iso E Super.",
    amounts: {
      "pineapple": 2.11,
      "fresh-citrus": 1.34,
      "black-currant": 0.77,
      "hedione": 0.96,
      "leather": 0.58,
      "iso-e-super": 1.54,
      "white-musk": 1.15,
      "galaxolide": 1.15
    },
    drops: {
      "pineapple": 70,
      "fresh-citrus": 45,
      "black-currant": 26,
      "hedione": 32,
      "leather": 19,
      "iso-e-super": 51,
      "white-musk": 38,
      "galaxolide": 39
    }
  },
  {
    id: "luminous-floral-nectar",
    title: "Luminous White Floral & Honey",
    tagline: "Opulent gardenia, honeyed Damask rose, dewy lotus & radiant Hedione",
    category: "custom_accord",
    defaultTarget: 9.60,
    description: "An ultra-luxurious, feminine bouquet. Creamy white tuberose and gardenia bathed in artisanal rose honey nectar and luminous Hedione, floating on a clean skin musk cloud.",
    amounts: {
      "fresh-citrus": 0.96,
      "lotus": 1.34,
      "white-floral": 1.73,
      "rose-honey": 1.34,
      "hedione": 1.34,
      "marshmallow": 0.96,
      "white-musk": 0.96,
      "galaxolide": 0.97
    },
    drops: {
      "fresh-citrus": 32,
      "lotus": 45,
      "white-floral": 58,
      "rose-honey": 45,
      "hedione": 45,
      "marshmallow": 32,
      "white-musk": 32,
      "galaxolide": 31
    }
  },
  {
    id: "cozy-praline-cloud",
    title: "Cozy Gourmand & Fluffy Cloud",
    tagline: "Caramelized praline, fluffy marshmallow, bourbon vanilla & sweet macrocyclic musk",
    category: "custom_accord",
    defaultTarget: 9.60,
    description: "The ultimate edible comfort. Spun sugar marshmallow and warm caramelized praline rounded by rich Madagascar vanilla and ethical skin musks.",
    amounts: {
      "fresh-citrus": 0.58,
      "pineapple": 0.58,
      "marshmallow": 1.54,
      "gourmand": 1.73,
      "vanilla": 1.92,
      "white-musk": 1.54,
      "ethylene-brassylate": 1.71
    },
    drops: {
      "fresh-citrus": 19,
      "pineapple": 19,
      "marshmallow": 51,
      "gourmand": 58,
      "vanilla": 64,
      "white-musk": 51,
      "ethylene-brassylate": 58
    }
  },
  {
    id: "minimalist-molecule-halo",
    title: "Velvet Second-Skin Molecule",
    tagline: "Iso E Super, radiant Hedione, diffusive Galaxolide & intimate White Musk",
    category: "custom_accord",
    defaultTarget: 9.60,
    description: "For the contemporary minimalist. An intoxicating clean pheromonic halo that melts into personal body heat, creating an unforgettable intimate trail.",
    amounts: {
      "fresh-citrus": 0.77,
      "lotus": 0.77,
      "hedione": 1.54,
      "iso-e-super": 2.50,
      "white-musk": 1.92,
      "galaxolide": 1.15,
      "ethylene-brassylate": 0.95
    },
    drops: {
      "fresh-citrus": 26,
      "lotus": 26,
      "hedione": 51,
      "iso-e-super": 83,
      "white-musk": 64,
      "galaxolide": 38,
      "ethylene-brassylate": 32
    }
  }
];

// ==========================================
// WORKSHOP TARGET DROP PROFILES (10ml Oil Bottle)
// ==========================================
const WORKSHOP_TARGET_PROFILES = [
  {
    id: "starter_60",
    name: "Light Concentré (60 Drops)",
    subtitle: "~2.10 Grams · Subtly Wearable",
    description: "A gentle roll-on concentration. Leaves room for delicate re-application throughout the day.",
    targetDrops: 60,
    approxGrams: 2.10,
    badge: "60 Drops · 2.1g"
  },
  {
    id: "golden_100",
    name: "Golden Master Balance (100 Drops)",
    subtitle: "~3.50 Grams · 1 Drop = Exactly 1%",
    description: "The official master workshop ratio. Each drop equals exactly 1.0% of your formula for intuitive math!",
    targetDrops: 100,
    approxGrams: 3.50,
    badge: "100 Drops · 3.5g (Recommended)"
  },
  {
    id: "attar_120",
    name: "Pure Attar Elixir (120 Drops)",
    subtitle: "~4.20 Grams · Maximum Density",
    description: "Ultra-concentrated pure oil luxury. Maximum depth, heavy tenacity, and formidable skin longevity.",
    targetDrops: 120,
    approxGrams: 4.20,
    badge: "120 Drops · 4.2g"
  }
];
