import type { Fabric } from "@/lib/data";
import finishedFabricCatalogue from "../content/finished-fabric-catalogue.json" with { type: "json" };

export type FabricCategory = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  sourcingOverview: string[];
  specificationChecks: Array<{
    label: string;
    detail: string;
  }>;
  developmentGuidance: string[];
  buyerIntent: string[];
  applications: string[];
  relatedFabricIds: string[];
  relatedLinks: Array<{
    href: string;
    label: string;
    description: string;
  }>;
  procurement?: {
    evidence: {
      capability: string;
      qualitySteps: string[];
      boundary: string;
    };
    cta: {
      heading: string;
      body: string;
      label: string;
      inquiryOptionId: string;
    };
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const publicFabrics: Fabric[] = finishedFabricCatalogue;

export const INITIAL_CATALOGUE_SIZE = 4;

export function getInitialPublicFabrics(): Fabric[] {
  const representativeFabrics = new Map<string, Fabric>();

  for (const fabric of publicFabrics) {
    const seriesKey = fabric.series?.trim() || fabric.id;
    if (!representativeFabrics.has(seriesKey)) {
      representativeFabrics.set(seriesKey, fabric);
    }
  }

  const initial = Array.from(representativeFabrics.values());
  const selectedIds = new Set(initial.map((fabric) => fabric.id));

  for (const fabric of publicFabrics) {
    if (initial.length >= INITIAL_CATALOGUE_SIZE) break;
    if (!selectedIds.has(fabric.id)) {
      initial.push(fabric);
      selectedIds.add(fabric.id);
    }
  }

  return initial.slice(0, INITIAL_CATALOGUE_SIZE);
}

export function getPublicFabricCount(): number {
  return publicFabrics.length;
}

export const publicFabricCategories: FabricCategory[] = [
  {
    slug: "cotton-jersey",
    name: "Cotton jersey fabrics",
    shortName: "Cotton jersey",
    description:
      "Soft, breathable knitted fabrics for T-shirts, base layers and everyday apparel programs.",
    sourcingOverview: [
      "Cotton jersey is a single-knit construction selected for a soft hand, breathable wear and flexible drape. The category name alone does not define the finished result: yarn count, cotton quality, stitch density, GSM, usable width, dyeing and finishing all change how the fabric cuts, sews and performs in a garment.",
      "Use this route to prepare a cotton jersey development brief rather than to assume a fixed stock specification. O'range Textile can review a target garment, reference swatch or performance brief, then confirm which finished-fabric article, sample route and commercial discussion fit the requirement.",
    ],
    specificationChecks: [
      {
        label: "Composition and yarn direction",
        detail:
          "State whether the programme needs 100% cotton, a cotton-rich blend or another fibre direction, and provide the preferred yarn count or reference hand feel when known.",
      },
      {
        label: "GSM and usable width",
        detail:
          "Give target weight and usable width as ranges when possible. The approved finished sample should be measured after the intended dyeing and finishing route.",
      },
      {
        label: "Surface and dimensional behaviour",
        detail:
          "Review skew, spirality, shrinkage, pilling, colourfastness and recovery against the garment pattern and care requirements instead of relying on the word jersey alone.",
      },
      {
        label: "Garment and order context",
        detail:
          "Include the garment type, colour direction, quantity, destination, testing needs and required documentation so sales can evaluate the correct sourcing path.",
      },
    ],
    developmentGuidance: [
      "For T-shirts and private-label basics, compare opacity, drape, seam appearance and wash stability on the actual colour and finish. A fabric that feels suitable in an unwashed swatch may behave differently after garment washing or repeated laundering.",
      "The public catalogue is a reference for current finished-fabric directions, not a promise that every cotton jersey specification is held in every colour. Send the closest article, a swatch image or the target specification for private sample and RFQ confirmation.",
    ],
    buyerIntent: [
      "cotton jersey fabric manufacturer China",
      "T-shirt fabric supplier Shaoxing",
      "combed cotton single jersey for apparel brands",
    ],
    applications: ["T-shirts", "Base layers", "Loungewear", "Private-label basics"],
    relatedFabricIds: [],
    procurement: {
      evidence: {
        capability:
          "O'range Textile can review a cotton jersey buyer brief, coordinate the closest finished sample and specification discussion with the sourcing team, and prepare an inquiry path for private confirmation.",
        qualitySteps: [
          "Match the labeled finished sample to the agreed cotton jersey specification.",
          "Review GSM, usable width, sewing behavior and wash results for the intended garment.",
          "Record dated approval, then confirm the current quotation for the requested program.",
        ],
        boundary:
          "The 104-product historical/draft catalogue does not verify a current exact cotton jersey article. Availability, specification, MOQ and lead time remain inquiry-specific.",
      },
      cta: {
        heading: "Review a cotton jersey brief with the sourcing team",
        body:
          "Send a target sample, garment use or specification so the closest finished-sample and quotation path can be reviewed.",
        label: "Request a cotton jersey sample or quotation",
        inquiryOptionId: "cotton-jersey",
      },
    },
    relatedLinks: [
      {
        href: "/blog/interlock-vs-jersey-fabric",
        label: "Compare interlock and jersey for a sourcing brief",
        description:
          "Use a side-by-side buyer decision covering construction, edge stability, drape, opacity and sample checks.",
      },
      {
        href: "/blog/what-is-interlock-fabric",
        label: "Compare jersey with interlock",
        description:
          "Review the construction, stability and buyer checks that distinguish single jersey from interlock.",
      },
      {
        href: "/blog/what-is-rib-knit-fabric",
        label: "Understand rib-knit stretch",
        description:
          "Compare body jersey with rib constructions used for trims and stretch-focused garments.",
      },
      {
        href: "/ready-stock-knit-fabrics",
        label: "Review current finished-fabric records",
        description:
          "Start from documented article data, then ask sales to confirm the closest sourcing route.",
      },
    ],
    faq: [
      {
        question: "What is cotton jersey fabric used for?",
        answer:
          "Cotton jersey fabric is commonly used for T-shirts, base layers, loungewear and soft everyday apparel.",
      },
      {
        question: "Can overseas buyers request cotton jersey samples?",
        answer:
          "Yes. O'range Textile supports fabric sample requests for overseas apparel buyers and sourcing teams.",
      },
    ],
  },
  {
    slug: "cotton-spandex-jersey",
    name: "Cotton spandex jersey fabrics",
    shortName: "Cotton spandex jersey",
    description:
      "Stretch cotton knits with recovery for fitted tees, childrenswear, loungewear and sports-inspired apparel.",
    sourcingOverview: [
      "Cotton spandex jersey combines a cotton-rich face and hand feel with elastane-supported stretch and recovery. The useful performance comes from the complete construction and finishing route, not from a composition ratio in isolation. Stitch density, elastane quality, heat history and fabric relaxation all affect width, torque and recovery.",
      "Use this category when the garment needs closer fit or repeat movement than a conventional cotton jersey can provide. Share the intended stretch direction, fit, wash method and recovery expectation so the offered finished sample can be assessed against the real garment rather than a generic stretch claim.",
    ],
    specificationChecks: [
      {
        label: "Stretch and recovery target",
        detail:
          "Define the required stretch direction and test method, then compare immediate and rested recovery on the finished sample before approving bulk production.",
      },
      {
        label: "Cotton-to-elastane balance",
        detail:
          "A common percentage reference is useful, but the hand, coverage and growth depend on yarn, loop length, density and finishing as well as fibre content.",
      },
      {
        label: "GSM, width and relaxation",
        detail:
          "Confirm weight and usable width after the fabric has relaxed. Stretch knits can change dimensions after finishing, packing and garment processing.",
      },
      {
        label: "End-use testing",
        detail:
          "For fitted tops, childrenswear or sports-inspired apparel, align pilling, colourfastness, shrinkage, seam recovery and wash testing with the intended market.",
      },
    ],
    developmentGuidance: [
      "A sourcing brief should include the garment silhouette, required extension, recovery tolerance, target opacity, colour, finish and care route. These details help separate a comfort-stretch jersey from a firmer performance-oriented construction.",
      "Exact sample availability, colour, quantity and commercial terms are confirmed privately. If the buyer has a benchmark garment, send its fabric specification or a reference swatch so the team can compare stretch, hand and finished appearance.",
    ],
    buyerIntent: [
      "cotton spandex jersey fabric supplier",
      "stretch cotton knit fabric manufacturer",
      "95 cotton 5 spandex jersey fabric",
    ],
    applications: ["Fitted T-shirts", "Childrenswear", "Sportswear", "Loungewear"],
    relatedFabricIds: [],
    procurement: {
      evidence: {
        capability:
          "O'range Textile can review a cotton spandex jersey buyer brief, coordinate sample, stretch and specification checks with the sourcing team, and prepare an inquiry path for private confirmation.",
        qualitySteps: [
          "Match the labeled finished sample to the agreed cotton spandex jersey specification.",
          "Review stretch, recovery, sewing behavior and wash results for the intended garment.",
          "Record dated approval, then confirm the current quotation for the requested program.",
        ],
        boundary:
          "The 104-product historical/draft catalogue does not verify a current exact cotton spandex jersey article. Availability, specification, MOQ and lead time remain inquiry-specific.",
      },
      cta: {
        heading: "Review a stretch-jersey brief before quoting",
        body:
          "Share the required extension, recovery, garment use and reference material for a sample and quotation review.",
        label: "Request a cotton spandex jersey sample or quotation",
        inquiryOptionId: "cotton-spandex-jersey",
      },
    },
    relatedLinks: [
      {
        href: "/blog/interlock-vs-jersey-fabric",
        label: "Decide between stretch jersey and interlock",
        description:
          "Compare fit, recovery, surface balance and garment applications before writing the fabric specification.",
      },
      {
        href: "/blog/what-is-rib-knit-fabric",
        label: "Compare jersey and rib stretch",
        description:
          "Review how rib geometry changes extension, recovery and garment use compared with stretch jersey.",
      },
      {
        href: "/blog/what-is-interlock-fabric",
        label: "Compare with interlock construction",
        description:
          "Use the interlock guide when the programme needs a smoother double-knit face or greater edge stability.",
      },
      {
        href: "/custom-knit-fabric-development",
        label: "Send a stretch-fabric development brief",
        description:
          "Share the garment, stretch, GSM, width, finish and testing requirements for direct review.",
      },
    ],
    faq: [
      {
        question: "Why use spandex in cotton jersey?",
        answer:
          "Spandex improves stretch and recovery, making cotton jersey suitable for fitted tops and comfort apparel.",
      },
      {
        question: "Does O'range Textile supply cotton-rich stretch knits?",
        answer:
          "Yes. O'range Textile supplies cotton spandex jersey and rib knit fabrics for overseas apparel programs.",
      },
    ],
  },
  {
    slug: "fleece-french-terry",
    name: "French terry fabrics",
    shortName: "French terry",
    description:
      "French terry fabric is a knitted sweatshirt fabric with a smooth face and visible loop-back reverse, commonly specified for hoodies, sweatshirts, joggers, shorts and loungewear.",
    sourcingOverview: [
      "French terry fabric is identified by its loop-back reverse rather than by one fixed composition, weight or performance result. Brushed fleece is a comparison route with a raised reverse; buyers should confirm the actual construction and finish on the offered sample instead of treating the names as interchangeable.",
      "Use this page to prepare a French terry brief for hoodies, sweatshirts, joggers, shorts or loungewear. Composition, yarn system, GSM, usable width, stretch, reverse finish, colour and test requirements should all be specified for the intended garment and confirmed against the current sample and quotation.",
    ],
    specificationChecks: [
      {
        label: "Composition and yarn system",
        detail:
          "State the intended fibre composition and any face, ground or loop-yarn direction. Treat these as buyer requirements to be checked against the offered article rather than as fixed category availability.",
      },
      {
        label: "GSM and seasonal weight",
        detail:
          "Give a target GSM or acceptable range together with the garment season and silhouette. Confirm the finished sample because weight alone does not establish warmth, drape or bulk.",
      },
      {
        label: "Usable width and relaxation",
        detail:
          "Specify the usable-width requirement and agree when it will be measured after finishing and fabric relaxation. Confirm the quoted width against the approved article and garment marker.",
      },
      {
        label: "Stretch and recovery",
        detail:
          "State whether the garment needs mechanical or elastane-supported stretch, the direction of stretch and the intended recovery check. Approve the result on the finished sample using an agreed method.",
      },
      {
        label: "Loop-back structure and finish",
        detail:
          "Describe the required face and visible loop-back reverse, including loop scale, hand feel and any surface finish. Use clear face-and-reverse references so brushed fleece is considered only as a separate comparison.",
      },
      {
        label: "Shrinkage, pilling and colourfastness",
        detail:
          "List the required test methods, tolerances and care conditions for shrinkage, pilling and colourfastness. Results remain article-, colour- and finish-specific and require current sample or production confirmation.",
      },
    ],
    developmentGuidance: [
      "Start from one of three development paths: identify a catalogue article, send a reference sample, or submit a specification-led brief. O'range Textile can coordinate the buyer brief, closest sample and specification review; the selected composition, GSM, usable width, finish, colour, quantity, MOQ and lead time are confirmed only in the current quotation.",
      "Include the garment type, season, target composition, GSM, usable width, stretch direction, face and loop-back reference, colour plan, destination and testing needs. Note whether the garment will be washed, printed, embroidered or paired with rib trims so the sourcing team can review the appropriate custom-development route.",
    ],
    buyerIntent: [
      "French terry fabric manufacturer China",
      "French terry fabric supplier",
      "French terry fabric for hoodies",
    ],
    applications: ["Hoodies", "Sweatshirts", "Joggers", "Loungewear"],
    relatedFabricIds: [],
    procurement: {
      evidence: {
        capability:
          "O'range Textile can review a French terry buyer brief, coordinate the closest finished sample and specification discussion with the sourcing team, and prepare the catalogue-article, reference-sample or specification-led inquiry path for private confirmation.",
        qualitySteps: [
          "Match the labeled finished sample to the agreed French terry composition, construction and finish.",
          "Review GSM, usable width, loop-back appearance, sewing behavior and requested test results for the intended garment.",
          "Record dated approval, then confirm the current quotation for the requested program.",
        ],
        boundary:
          "The 104-product historical/draft catalogue does not verify a current exact French terry article or production specification. Availability, composition, GSM, usable width, finish, test result, MOQ and lead time remain inquiry-specific.",
      },
      cta: {
        heading: "Review a French terry brief before quoting",
        body:
          "Send the target composition, GSM, usable width, face, loop-back reverse, garment use and reference material for a sample and current quotation review.",
        label: "Request a French terry sample or quotation",
        inquiryOptionId: "french-terry",
      },
    },
    relatedLinks: [
      {
        href: "/blog/french-terry-fabric-vs-fleece",
        label: "Compare French terry and fleece",
        description:
          "Choose between a loop-back reverse and a brushed or raised finish using garment, season and test requirements.",
      },
      {
        href: "/blog/french-terry-fabric-for-hoodies",
        label: "Specify French terry for hoodies",
        description:
          "Turn the hoodie silhouette, season, GSM, reverse surface and trim plan into a sample-ready sourcing brief.",
      },
      {
        href: "/blog/heavyweight-french-terry-fabric",
        label: "Source heavyweight French terry",
        description:
          "Review weight, usable width, shrinkage, seam bulk and wash approval for substantial sweatshirt programs.",
      },
      {
        href: "/fabrics/rib-knit-fabric",
        label: "Coordinate French terry with rib trims",
        description:
          "Review rib-knit directions for cuffs, neckbands and waistbands that must be sampled with the body fabric.",
      },
      {
        href: "/fabrics/cotton-spandex-jersey",
        label: "Compare a lighter stretch-knit route",
        description:
          "Use cotton spandex jersey when the garment brief prioritizes a lighter hand, fitted silhouette and stretch recovery.",
      },
      {
        href: "/custom-knit-fabric-development",
        label: "Send a French terry development brief",
        description:
          "Share a catalogue article, reference sample or specification-led brief for sample and quotation review.",
      },
    ],
    faq: [
      {
        question: "What garments use French terry fabric?",
        answer:
          "French terry fabric is often used for hoodies, sweatshirts, joggers, shorts and comfort-focused apparel. Buyers should select composition, GSM, usable width, loop-back finish and test requirements for the actual garment rather than approve by category name alone.",
      },
      {
        question: "Can O'range Textile support private-label hoodie fabrics?",
        answer:
          "Yes. Buyers can submit a hoodie specification, reference sample or catalogue direction for a French terry sample review. Exact availability, MOQ, lead time and price are confirmed in the current quotation.",
      },
      {
        question: "How is French terry different from brushed fleece?",
        answer:
          "French terry normally retains visible loops on the reverse, while brushed fleece has a raised reverse created through additional finishing. Weight, hand, warmth and durability still depend on the exact article, so buyers should compare labeled finished samples.",
      },
      {
        question: "What GSM and usable width should a hoodie buyer specify?",
        answer:
          "Specify a target GSM or acceptable range based on the hoodie season and silhouette, plus the minimum usable width required by the marker. There is no universal hoodie value; confirm both measurements on the relaxed finished sample and current quotation.",
      },
      {
        question: "Which shrinkage and pilling checks matter for French terry?",
        answer:
          "The brief should state the intended care cycle, length-and-width shrinkage method, pilling method and acceptance criteria. Where reverse appearance or shedding matters, add those checks and approve the actual article, colour and finish.",
      },
      {
        question: "Can buyers customize composition, colour and reverse finish?",
        answer:
          "Buyers can submit target composition, colour and loop-back finish requirements through the custom-development route. Feasibility, sample path, MOQ, lead time, testing and price are confirmed for the specific inquiry rather than promised by the category page.",
      },
    ],
  },
  {
    slug: "scuba-air-layer",
    name: "Scuba and air-layer knit fabrics",
    shortName: "Scuba and air-layer",
    description:
      "Structured knitted fabrics for hoodies, jackets and garments that need body and shape retention.",
    sourcingOverview: [
      "Scuba and air-layer are commercial names used for structured knit fabrics, but they do not prove one universal construction. A scuba-style double knit may have a compact smooth face and resilient body; an air-layer article may use a layered construction for volume and shape. Neither term should automatically be treated as foam-backed neoprene or as a verified spacer fabric.",
      "O'range Textile's documented finished-fabric catalogue includes air-layer articles with article-level composition, GSM and usable-width references. Buyers should choose a relevant direction, then approve the exact finished sample for thickness, compression, recovery, surface, drape and garment construction.",
    ],
    specificationChecks: [
      {
        label: "Construction identity",
        detail:
          "Ask whether the offered article is a compact double knit, layered air-layer construction or another structured knit. Confirm the name against the physical sample.",
      },
      {
        label: "Body and recovery",
        detail:
          "Evaluate thickness, compression, crease recovery and shape retention in the intended panel size, not only in a small hand swatch.",
      },
      {
        label: "Composition, GSM and width",
        detail:
          "Reference the exact article record and re-confirm the production specification, usable width and finish for the requested colour and order.",
      },
      {
        label: "Garment engineering",
        detail:
          "Check seam bulk, edge finish, needle response, bonding or fusing needs and heat sensitivity before approving a hoodie, jacket or structured casualwear style.",
      },
    ],
    developmentGuidance: [
      "Start with an article number from the finished-fabric catalogue or send a reference garment. State whether the priority is clean structure, cushioning, stretch, warmth, smoothness or a specific surface, then include quantity, destination and required testing.",
      "Catalogue data narrows the search but does not replace sample approval. Colour, finish, live availability and commercial terms are confirmed with the sales team for the actual inquiry, and unsupported spacer or neoprene claims are not inferred from the category name.",
    ],
    buyerIntent: [
      "scuba knit fabric supplier",
      "air-layer knit fabric manufacturer China",
      "structured hoodie fabric sourcing",
    ],
    applications: ["Hoodies", "Jackets", "Outerwear", "Structured casualwear"],
    relatedFabricIds: ["finished-gd2515", "finished-gd2672"],
    relatedLinks: [
      {
        href: "/blog/what-is-scuba-knit-fabric",
        label: "Read the scuba and air-layer buyer guide",
        description:
          "Review naming boundaries, construction questions and finished-sample checks before sourcing.",
      },
      {
        href: "/blog/jacquard-knit-vs-woven-jacquard",
        label: "Compare structured pattern routes",
        description:
          "Use the jacquard comparison when pattern structure matters alongside body and shape retention.",
      },
      {
        href: "/fabrics/scuba-air-layer-fabric",
        label: "Open the documented air-layer range",
        description:
          "Review representative finished articles, composition ranges and sample-confirmation guidance.",
      },
    ],
    faq: [
      {
        question: "What is air-layer knit fabric used for?",
        answer:
          "Air-layer knit fabric is used for garments that need structure, body and shape retention, including hoodies and jackets.",
      },
      {
        question: "Is scuba knit suitable for overseas apparel programs?",
        answer:
          "Yes. O'range Textile supplies structured scuba and air-layer knits for apparel buyers that need stable production fabrics.",
      },
    ],
  },
];

export function getPublicFabrics(): Fabric[] {
  return publicFabrics;
}

export function getPublicFabricCategories(): FabricCategory[] {
  return publicFabricCategories;
}

export function getPublicFabricCategory(slug: string): FabricCategory | undefined {
  return publicFabricCategories.find((category) => category.slug === slug);
}

export function getFabricsForCategory(slug: string): Fabric[] {
  const category = getPublicFabricCategory(slug);
  if (!category) return [];
  const related = new Set(category.relatedFabricIds);
  return publicFabrics.filter((fabric) => related.has(fabric.id));
}
