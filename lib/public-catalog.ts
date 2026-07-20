import type { Fabric } from "@/lib/data";
import finishedFabricCatalogue from "../content/finished-fabric-catalogue.json" with { type: "json" };

export type FabricCategory = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  metaDescription: string;
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
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const publicFabrics: Fabric[] = finishedFabricCatalogue;

export const publicFabricCategories: FabricCategory[] = [
  {
    slug: "cotton-jersey",
    name: "Cotton jersey fabrics",
    shortName: "Cotton jersey",
    description:
      "Soft, breathable knitted fabrics for T-shirts, base layers and everyday apparel programs.",
    metaDescription:
      "Source cotton jersey fabrics from O'range Textile, a Shaoxing Keqiao knit fabric manufacturer for T-shirts, basics and private-label apparel.",
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
    relatedFabricIds: ["cotton-jersey-32s"],
    relatedLinks: [
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
    metaDescription:
      "Cotton spandex jersey fabrics from O'range Textile for stretch T-shirts, childrenswear, loungewear and active-inspired apparel.",
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
    relatedFabricIds: ["cotton-spandex-jersey-32s", "rib-knit-cotton-spandex"],
    relatedLinks: [
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
    name: "Fleece and French terry fabrics",
    shortName: "Fleece and French terry",
    description:
      "Comfort-focused sweatshirt and hoodie fabrics for casualwear, streetwear and private-label collections.",
    metaDescription:
      "Fleece and French terry knit fabrics for hoodies and sweatshirts, supplied by O'range Textile in Shaoxing Keqiao.",
    sourcingOverview: [
      "French terry and fleece are related sweatshirt-fabric directions but they are not interchangeable names. French terry usually retains visible loops on the back, while fleece commonly refers to a raised or brushed back. Yarn system, loop structure, brushing, shearing and finishing determine warmth, bulk, surface shedding and garment appearance.",
      "Use this page to frame a hoodie, sweatshirt or loungewear brief around the required face, back and seasonal performance. The public finished-fabric catalogue contains several structured and raised-surface directions, while the exact French terry or fleece article must be confirmed against the buyer's sample and specification.",
    ],
    specificationChecks: [
      {
        label: "Back construction and finish",
        detail:
          "Specify loop-back French terry, brushed fleece or another raised-surface direction. Ask for clear face and reverse images before selecting a sample.",
      },
      {
        label: "Weight, warmth and drape",
        detail:
          "Select GSM with the garment season and silhouette in mind. A heavier number does not by itself confirm warmth, softness or finished bulk.",
      },
      {
        label: "Surface durability",
        detail:
          "Review pilling, shedding, abrasion, colourfastness and appearance after laundering, especially when the reverse is brushed or raised.",
      },
      {
        label: "Shrinkage and garment processing",
        detail:
          "Confirm dimensional stability after the intended dyeing, washing and finishing route, including any garment wash that can alter hand and measurements.",
      },
    ],
    developmentGuidance: [
      "For a useful quotation, send the garment type, season, composition direction, target GSM, usable width, face and back reference, colour plan and destination. Note whether the fabric will be garment washed, printed, embroidered or combined with rib trims.",
      "O'range Textile reviews sample and order details directly because colour, raising, finishing and commercial conditions vary by programme. The website does not present a fixed MOQ, lead time or universal stock promise for this category.",
    ],
    buyerIntent: [
      "French terry fabric manufacturer China",
      "hoodie fleece fabric supplier",
      "sweatshirt knit fabric sourcing",
    ],
    applications: ["Hoodies", "Sweatshirts", "Streetwear", "Loungewear"],
    relatedFabricIds: ["fleece-french-terry-cotton-poly"],
    relatedLinks: [
      {
        href: "/blog/what-is-scuba-knit-fabric",
        label: "Compare fleece with structured scuba knit",
        description:
          "Consider a smoother structured alternative when the garment needs body rather than a looped or brushed reverse.",
      },
      {
        href: "/blog/what-is-double-knit-fabric",
        label: "Understand double-knit alternatives",
        description:
          "Review how double-knit constructions differ from sweatshirt knits in face, stability and garment use.",
      },
      {
        href: "/ready-stock-knit-fabrics",
        label: "Review raised-surface finished articles",
        description:
          "Use documented article data as a starting reference and confirm the exact surface with sales.",
      },
    ],
    faq: [
      {
        question: "What garments use French terry fabric?",
        answer:
          "French terry fabric is often used for hoodies, sweatshirts, casual pants and comfort-focused apparel.",
      },
      {
        question: "Can O'range Textile support private-label hoodie fabrics?",
        answer:
          "Yes. The company supports fleece and French terry sourcing for private-label hoodie and sweatshirt programs.",
      },
    ],
  },
  {
    slug: "scuba-air-layer",
    name: "Scuba and air-layer knit fabrics",
    shortName: "Scuba and air-layer",
    description:
      "Structured knitted fabrics for hoodies, jackets and garments that need body and shape retention.",
    metaDescription:
      "Source scuba and air-layer knit fabrics from O'range Textile for structured hoodies, jackets and shape-retaining apparel.",
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
