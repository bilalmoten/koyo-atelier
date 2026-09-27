/**
 * KOYO Perfume Atelier - Data Repository (10ml Pure Perfume Oil Edition)
 * 17-accord database and scent descriptions.
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
    shortDescription: "Bright, zesty citrus. Adds freshness.",
    fullDescription: "A citrus scent impression with lemon-zest sharpness, a bergamot-like freshness and softer mandarin-like sweetness. It gives the opening a crisp, lively character.",
    pairsWith: ["Pineapple Accord", "Black Currant Accord", "Hedione", "Iso E Super", "White Musk"],
    color: "#f59e0b",
    tags: ["Sparkling", "Bergamot", "Zesty", "Luminous"],
    perfumerTip: "Try it with fruit notes for a juicy opening, or with White Musk for a clean contrast."
  },
  {
    id: "pineapple",
    name: "Pineapple Accord",
    family: "Fruity / Tropical",
    role: "TOP",
    roleLabel: "TOP NOTE",
    shortDescription: "Juicy, sweet-tart pineapple. Adds a fruity lift.",
    fullDescription: "A tropical fruit impression that suggests ripe pineapple, with a tart edge and a little caramel-like sweetness. Think sunny, playful and juicy.",
    pairsWith: ["Black Currant Accord", "Fresh Citrus Accord", "Leather Accord", "Galaxolide", "Iso E Super"],
    color: "#eab308",
    tags: ["Juicy", "Tropical", "Playful", "Modern"],
    perfumerTip: "Try it with Fresh Citrus for brightness or Leather for a dry contrast."
  },
  {
    id: "black-currant",
    name: "Black Currant Accord",
    family: "Fruity / Berry",
    role: "TOP",
    roleLabel: "TOP NOTE",
    shortDescription: "Tart, dark berries. Adds a tangy edge.",
    fullDescription: "A cassis-like berry impression with a slightly green, leafy edge. It feels darker and sharper than pineapple, with a juicy sweet-sour character.",
    pairsWith: ["Pineapple Accord", "Rose Honey Accord", "White Floral Accord", "Oud Accord", "White Musk"],
    color: "#a855f7",
    tags: ["Tart", "Bold", "Cassis", "Sophisticated"],
    perfumerTip: "Try it against sweet florals or vanilla for a tangy contrast."
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
    shortDescription: "Cool, watery flowers. Adds an airy feel.",
    fullDescription: "A soft floral impression that brings to mind wet petals, clear water and a little greenery. Its character is light, quiet and fresh.",
    pairsWith: ["White Floral Accord", "Fresh Citrus Accord", "Hedione", "White Musk", "Galaxolide"],
    color: "#06b6d4",
    tags: ["Watery", "Airy", "Serene", "Delicate"],
    perfumerTip: "Try it with White Musk for a clean direction, or alongside richer floral notes."
  },
  {
    id: "white-floral",
    name: "White Floral Accord",
    family: "Floral",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Creamy white flowers. Adds a floral heart.",
    fullDescription: "A rounded floral impression reminiscent of jasmine, gardenia and tuberose. Think soft petals with a lush, creamy texture.",
    pairsWith: ["Rose Honey Accord", "Lotus Accord", "Hedione", "Marshmallow Accord", "Vanilla Accord"],
    color: "#ec4899",
    tags: ["Creamy", "Opulent", "Jasmine", "Velvety"],
    perfumerTip: "Try it with Lotus for a fresher floral direction or Vanilla for more warmth."
  },
  {
    id: "rose-honey",
    name: "Rose Honey Accord",
    family: "Floral / Sweet",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Soft rose with honey-like sweetness. Adds warmth.",
    fullDescription: "A rose-petal impression with a golden, honey-like sweetness. The character is floral, rounded and warm; these are scent associations, not an ingredient list.",
    pairsWith: ["White Floral Accord", "Vanilla Accord", "Tobacco Accord", "Oud Accord", "Marshmallow Accord"],
    color: "#f43f5e",
    tags: ["Romantic", "Honeyed", "Warm", "Sensual"],
    perfumerTip: "Try it with Oud for woody contrast or Vanilla for a softer, sweeter direction."
  },
  {
    id: "hedione",
    name: "Hedione",
    family: "Transparent Floral / Booster",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Light, airy jasmine. Adds a sheer floral feel.",
    fullDescription: "A delicate jasmine-like character with a fresh, transparent feel. It offers an airy floral direction without the creamy richness of the White Floral Accord.",
    pairsWith: ["Fresh Citrus Accord", "Iso E Super", "White Floral Accord", "Lotus Accord", "Galaxolide"],
    color: "#38bdf8",
    tags: ["Radiant", "Booster", "Transparent", "Diffusion"],
    perfumerTip: "Try it alongside citrus or fuller floral notes when you want an airier character."
  },
  {
    id: "marshmallow",
    name: "Marshmallow Accord",
    family: "Sweet / Confectionery",
    role: "HEART",
    roleLabel: "HEART NOTE",
    shortDescription: "Fluffy, powdery sweetness. Adds softness.",
    fullDescription: "A confectionery impression of powdered sugar, soft vanilla and a faint floral touch. Think a sweet, airy cloud rather than caramel richness.",
    pairsWith: ["White Floral Accord", "Rose Honey Accord", "Gourmand Accord", "Vanilla Accord", "White Musk"],
    color: "#f472b6",
    tags: ["Fluffy", "Powdery", "Playful", "Sweet"],
    perfumerTip: "Try it with White Floral for a sweet floral direction or with White Musk for a powdery feel."
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
    shortDescription: "Sweet caramel and toasted nuts. Adds richness.",
    fullDescription: "A dessert-like impression of caramel, praline and toasted hazelnuts, with a creamy vanilla-like edge. These describe its smell, not edible ingredients.",
    pairsWith: ["Marshmallow Accord", "Vanilla Accord", "Tobacco Accord", "Oud Accord", "White Musk"],
    color: "#d97706",
    tags: ["Cozy", "Edible", "Praline", "Indulgent"],
    perfumerTip: "Try it with Vanilla for a cozy direction or a little Tobacco for contrast."
  },
  {
    id: "vanilla",
    name: "Vanilla Accord",
    family: "Warm Sweet / Gourmand",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Sweet, creamy vanilla. Adds warmth.",
    fullDescription: "A vanilla-bean scent impression with soft amber-like warmth and a gentle woody edge. Think smooth, cozy and sweet, without implying a particular ingredient origin.",
    pairsWith: ["Tobacco Accord", "Oud Accord", "Rose Honey Accord", "Gourmand Accord", "Iso E Super"],
    color: "#b45309",
    tags: ["Bourbon", "Creamy", "Sensual", "Addictive"],
    perfumerTip: "Try it with woods or florals for a creamy contrast."
  },
  {
    id: "iso-e-super",
    name: "Iso E Super",
    family: "Woody / Ambergris",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Soft, dry woods. Adds a woody feel.",
    fullDescription: "A smooth cedar-like, amber-woody impression with a subtle, airy character. It offers a quieter woody direction than the Oud Accord.",
    pairsWith: ["Hedione", "Oud Accord", "Pineapple Accord", "White Musk", "Galaxolide"],
    color: "#64748b",
    tags: ["Velvety", "Cedarwood", "Molecule", "Pheromonic"],
    perfumerTip: "Try it with Hedione for an airy direction or Pineapple for a fruity-woody contrast."
  },
  {
    id: "white-musk",
    name: "White Musk",
    family: "Clean Musk",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Clean, soft musk. Adds a freshly washed feel.",
    fullDescription: "A musk impression reminiscent of clean cotton, fresh linen and warm skin. Think gentle, smooth and lightly powdery.",
    pairsWith: ["Galaxolide", "Ethylene Brassylate", "Lotus Accord", "Iso E Super", "Vanilla Accord"],
    color: "#94a3b8",
    tags: ["Clean", "Skin-Scent", "Smooth", "Modern"],
    perfumerTip: "Try it with Lotus for a clean floral direction or Vanilla for a warmer feel."
  },
  {
    id: "galaxolide",
    name: "Galaxolide",
    family: "Clean Floral Musk",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Soft musk with a floral sweetness. Adds a clean feel.",
    fullDescription: "A rounded musk character with a soft floral sweetness and a laundry-like impression. Think plush, clean and gently powdery.",
    pairsWith: ["White Musk", "Ethylene Brassylate", "Pineapple Accord", "White Floral Accord", "Hedione"],
    color: "#818cf8",
    tags: ["Radiant", "Diffusive", "Volume", "Velvety"],
    perfumerTip: "Try it with fruity or floral notes for a softer contrast."
  },
  {
    id: "ethylene-brassylate",
    name: "Ethylene Brassylate",
    family: "Sweet Macrocyclic Musk",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Smooth, gently sweet musk. Adds a rounded feel.",
    fullDescription: "A soft musk character with gently sweet, woody and ambrette-like nuances. It offers a smooth background character; lasting power depends on the full blend.",
    pairsWith: ["White Musk", "Galaxolide", "Leather Accord", "Tobacco Accord", "Oud Accord"],
    color: "#6366f1",
    tags: ["Fixative", "Elegant", "Longevity", "Tenacious"],
    perfumerTip: "Try it with White Musk for a musky direction or with darker woods for contrast."
  },
  {
    id: "leather",
    name: "Leather Accord",
    family: "Dark / Leather",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Dry suede with a smoky edge. Adds depth.",
    fullDescription: "A leather-like impression of dry suede, warm saddle leather and a little smoke. Its character is textured and darker than the fruit or floral notes.",
    pairsWith: ["Pineapple Accord", "Fresh Citrus Accord", "Tobacco Accord", "Oud Accord", "Iso E Super"],
    color: "#78350f",
    tags: ["Textured", "Bold", "Smoky", "Haute"],
    perfumerTip: "Try a smaller share first if you want fruit or florals to remain the main idea."
  },
  {
    id: "tobacco",
    name: "Tobacco Accord",
    family: "Warm / Smoky",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Warm, sweet smoke. Adds a darker warmth.",
    fullDescription: "A tobacco-leaf scent impression with dry, honey-like sweetness and an amber-like warmth. Think warm leaves and a soft smoky edge.",
    pairsWith: ["Vanilla Accord", "Rose Honey Accord", "Oud Accord", "Gourmand Accord", "Leather Accord"],
    color: "#92400e",
    tags: ["Smoky", "Opulent", "Sensual", "Warm"],
    perfumerTip: "Try it with Vanilla for a warm contrast or Rose Honey for a floral direction."
  },
  {
    id: "oud",
    name: "Oud Accord",
    family: "Woody / Oriental",
    role: "BASE",
    roleLabel: "BASE NOTE",
    shortDescription: "Dark, resinous woods. Adds depth.",
    fullDescription: "An agarwood-like scent impression with resinous woods, a smoky edge and warm amber-like nuances. This describes the accord character, not a claim of natural oud content.",
    pairsWith: ["Rose Honey Accord", "Vanilla Accord", "Tobacco Accord", "Iso E Super", "Black Currant Accord"],
    color: "#451a03",
    tags: ["Agarwood", "Majestic", "Resinous", "Prestige"],
    perfumerTip: "Try a smaller share alongside Rose Honey or Vanilla for woody contrast."
  }
];


// Hidden search vocabulary: scent associations, moods, seasons and common names.
const SCENT_SEARCH_TAGS = {
  'fresh-citrus': 'sour tart tangy sharp acidic zest zesty lemon lime orange mandarin bergamot grapefruit citrus fresh refreshing cool cooling crisp clean bright sunny sunshine summer summery spring daytime morning energetic uplifting sparkling light juicy beach vacation holiday sporty unisex lemonade nimbu khatta',
  pineapple: 'sour tart tangy sweet juicy fruity fruit tropical exotic yellow sunny sunshine summer summery beach vacation holiday playful cheerful fun bright fresh cocktail island ananas sweet-sour',
  'black-currant': 'sour tart tangy sharp fruity fruit berry berries dark purple cassis blackcurrant currant green leafy juicy bold modern summer spring autumn fall jam punch sophisticated fruity-sour',
  lotus: 'cool cooling fresh refreshing watery aquatic water rain rainy dewy dew breezy airy light delicate soft floral flower flowers clean serene calm calming peaceful spa zen relaxing spring summer summery morning daytime ocean sea beach green petals transparent',
  'white-floral': 'floral flower flowers bouquet jasmine gardenia tuberose white creamy lush rich soft silky elegant classic polished romantic romance wedding bridal feminine spring summer evening garden blooming blossom blossoms',
  'rose-honey': 'rose rosy floral flower flowers petals honey nectar sweet warm warmth cozy cosy romantic romance date night evening wedding bridal autumn fall winter sensual rich velvety soft golden gulab shehad',
  hedione: 'jasmine floral flower flowers airy air light transparent fresh refreshing cool clean bright luminous radiant breezy dewy soft subtle spring summer summery daytime morning diffusion booster lift spacious modern unisex',
  marshmallow: 'sweet sugar sugary candy confection dessert vanilla powder powdery fluffy soft cozy cosy comforting comfort playful nostalgic pastel pink feminine romantic winter autumn fall cotton candy cloud',
  gourmand: 'sweet sugar sugary dessert edible caramel praline hazelnut nutty nuts roasted toasted creamy rich warm warmth cozy cosy comforting comfort indulgent bakery cake candy chocolate gourmand autumn fall winter evening date night',
  vanilla: 'sweet vanilla creamy cream milky smooth soft warm warmth cozy cosy comforting comfort dessert bakery cake cookies cookie ice cream bourbon amber rich sensual romantic winter autumn fall evening date night',
  'iso-e-super': 'wood woods woody cedar cedarwood amber ambergris smooth velvety dry transparent airy subtle minimalist minimal modern molecule skin second skin intimate clean soft unisex masculine office everyday daytime autumn fall',
  'white-musk': 'musk musky clean fresh refreshing cool soft smooth skin intimate subtle minimalist minimal everyday office daytime linen laundry cotton soap soapy shower powder powdery cozy cosy comforting comfort spring summer summery unisex',
  galaxolide: 'musk musky clean laundry linen cotton soap soapy soft fluffy smooth sweet floral airy radiant diffusive diffusion volume powder powdery fresh everyday office spring summer unisex',
  'ethylene-brassylate': 'musk musky soft smooth sweet subtle elegant warm skin intimate woody ambrette clean powder powdery round rounding gentle comforting cozy cosy drydown fixative lasting longevity base everyday unisex winter',
  leather: 'leather leathery suede dry textured smoky smokey smoke birch saddle dark bold daring deep depth rich warm rugged masculine sophisticated niche autumn fall winter evening night jacket',
  tobacco: 'tobacco smoky smokey smoke warm warmth sweet dark deep rich cozy cosy dry aromatic golden honey leaves leaf autumn fall winter evening night masculine sophisticated lounge',
  oud: 'oud oudh wood woods woody agarwood resin resinous dark deep depth rich warm warmth smoky smokey smoke earthy bold intense oriental eastern arabic arabian attar luxury incense bakhoor autumn fall winter evening night unisex masculine'
};
for (const note of ACCORDS_DATA) note.searchTags = SCENT_SEARCH_TAGS[note.id].split(' ');
