export const SEO_BRAND_NAME = "O'range Textile";
export const SEO_SITE_ORIGIN = "https://orangetextiles.com";

export type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export type SeoPageType =
  | "homepage"
  | "service"
  | "guide"
  | "blog"
  | "about";

export type PublicPageSeo = {
  path: string;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  searchIntent: SearchIntent;
  topicCluster: string;
  targetPageType: SeoPageType;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  updatedAt: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
};

const publicPageSeo = [
  {
    path: "/",
    primaryKeyword: "double knit fabric",
    secondaryKeywords: [
      "double knit fabric supplier",
      "knitted fabric manufacturer",
      "knit fabric supplier",
      "double knit fabric USA",
      "double knit fabric Australia",
    ],
    searchIntent: "commercial",
    topicCluster: "core-category",
    targetPageType: "homepage",
    metaTitle:
      "Double Knit Fabric for Global Apparel Brands | O'range Textile",
    metaDescription:
      "Double knit fabric sourcing for global apparel brands, including buyers in the United States and Australia. Compare finished constructions, documented specifications, sample routes and supplier capabilities before sending an RFQ to O'range Textile.",
    h1: "Double Knit Fabric for Global Apparel Sourcing",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/about",
    primaryKeyword: "O'range Textile",
    secondaryKeywords: [
      "Shaoxing knit fabric company",
      "China knit fabric supplier",
      "knit fabric export company",
    ],
    searchIntent: "navigational",
    topicCluster: "company-trust",
    targetPageType: "about",
    metaTitle: "O'range Textile | Knit Fabric Company in Shaoxing",
    metaDescription:
      "O'range Textile is the export-focused knit fabric business of Shaoxing Shicheng Textile Products Co., Ltd. Explore its parent-company manufacturing network, 200+ circular knitting machines, GRS scope documentation and support for global B2B buyers.",
    h1: "O'range Textile: Export-Focused Knit Fabric Sourcing",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/fabrics",
    primaryKeyword: "finished knit fabrics",
    secondaryKeywords: [
      "knit fabric supplier",
      "wholesale knit fabric",
      "finished fabric supplier",
      "knitted fabric manufacturer",
    ],
    searchIntent: "commercial",
    topicCluster: "commercial-catalogue",
    targetPageType: "service",
    metaTitle:
      "Finished Knit Fabrics for B2B Sourcing | O'range Textile",
    metaDescription:
      "Finished knit fabrics for global B2B apparel sourcing teams. Review 104 documented articles across 11 series, compare composition, GSM and usable width, then request samples and confirm colour, finish, quantity and commercial terms.",
    h1: "Finished Knit Fabrics for Apparel Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/ready-stock-knit-fabrics",
    primaryKeyword: "ready-stock knit fabrics",
    secondaryKeywords: [
      "wholesale knit fabric",
      "ready stock fabric supplier",
      "fabric stock for apparel brands",
    ],
    searchIntent: "transactional",
    topicCluster: "commercial-stock",
    targetPageType: "service",
    metaTitle:
      "Ready-Stock Knit Fabrics for Buyers | O'range Textile",
    metaDescription:
      "Ready-stock knit fabrics for global B2B buyers seeking documented article references. Review composition, GSM and usable width, shortlist a fabric, then confirm current colour, usable quantity, finish, sample route and commercial terms.",
    h1: "Ready-Stock Knit Fabrics for B2B Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/finished-double-knit-fabrics",
    primaryKeyword: "double knit fabric manufacturer",
    secondaryKeywords: [
      "double knit fabric supplier",
      "knitted fabric manufacturer",
      "China double knit manufacturer",
    ],
    searchIntent: "transactional",
    topicCluster: "commercial-manufacturer",
    targetPageType: "service",
    metaTitle:
      "Double Knit Fabric Manufacturer in China | O'range Textile",
    metaDescription:
      "Double knit fabric manufacturer support for global apparel brands, US buyers and Australian sourcing teams. Compare interlock, Ponte Roma, scuba, jacquard and wool-blend directions, then request samples and a specification-based quotation.",
    h1: "Double Knit Fabric Manufacturer for Apparel Brands",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/custom-knit-fabric-development",
    primaryKeyword: "custom knit fabric development",
    secondaryKeywords: [
      "custom knit fabric supplier",
      "knit fabric development service",
      "custom fabric sampling",
    ],
    searchIntent: "transactional",
    topicCluster: "commercial-development",
    targetPageType: "service",
    metaTitle: "Custom Knit Fabric Development | O'range Textile",
    metaDescription:
      "Custom knit fabric development for global apparel brands with a reference garment, swatch or technical brief. Define construction, composition, GSM, width, colour, finish and tests, then send the requirement for sample-route and quotation review.",
    h1: "Custom Knit Fabric Development for Apparel Programs",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/fabrics/cotton-jersey",
    primaryKeyword: "cotton jersey fabric",
    secondaryKeywords: [
      "cotton jersey fabric supplier",
      "cotton jersey fabric manufacturer",
      "jersey fabric for T-shirts",
    ],
    searchIntent: "commercial",
    topicCluster: "product-jersey",
    targetPageType: "service",
    metaTitle: "Cotton Jersey Fabric Supplier | O'range Textile",
    metaDescription:
      "Cotton jersey fabric sourcing for global apparel brands developing T-shirts, base layers and private-label basics. Review yarn, GSM, usable width, drape and dimensional checks, then send a sample reference or specification for confirmation.",
    h1: "Cotton Jersey Fabric for T-Shirts and Basics",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/cotton-spandex-jersey",
    primaryKeyword: "cotton spandex jersey fabric",
    secondaryKeywords: [
      "cotton spandex jersey fabric supplier",
      "stretch cotton knit fabric",
      "95 cotton 5 spandex jersey",
    ],
    searchIntent: "commercial",
    topicCluster: "product-jersey",
    targetPageType: "service",
    metaTitle:
      "Cotton Spandex Jersey Fabric Supplier | O'range Textile",
    metaDescription:
      "Cotton spandex jersey fabric for fitted T-shirts, childrenswear, loungewear and active-inspired apparel. Compare stretch, recovery, opacity, GSM and relaxed width, then provide the garment brief and testing needs for sample review.",
    h1: "Cotton Spandex Jersey Fabric for Stretch Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/fleece-french-terry",
    primaryKeyword: "french terry fabric",
    secondaryKeywords: [
      "French terry fabric supplier",
      "hoodie fabric manufacturer",
      "sweatshirt knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-terry",
    targetPageType: "service",
    metaTitle: "French Terry Fabric Supplier | O'range Textile",
    metaDescription:
      "French terry fabric sourcing for hoodies, sweatshirts, streetwear and loungewear programs. Compare loop-back and brushed directions, GSM, width, shrinkage and surface durability, then send the garment specification for sample confirmation.",
    h1: "French Terry Fabric for Hoodies and Sweatshirts",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/scuba-air-layer",
    primaryKeyword: "air-layer fabric",
    secondaryKeywords: [
      "air-layer knit fabric",
      "air-layer fabric supplier",
      "structured knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-structured-knit",
    targetPageType: "service",
    metaTitle: "Air-Layer Fabric Supplier | O'range Textile",
    metaDescription:
      "Air-layer fabric sourcing for structured hoodies, jackets and shape-retaining apparel. Review construction identity, thickness, compression, GSM, usable width and recovery, then select a documented article or send a reference garment for sampling.",
    h1: "Air-Layer Fabric for Structured Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/interlock-fabric",
    primaryKeyword: "interlock fabric",
    secondaryKeywords: [
      "interlock fabric supplier",
      "interlock fabric manufacturer",
      "double knit interlock fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-double-knit",
    targetPageType: "service",
    metaTitle: "Interlock Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Interlock fabric development for global apparel brands seeking a smooth double-knit face, stability and coverage. Compare composition, GSM, usable width, stretch and recovery, then request the closest finished sample and a specification-based quotation.",
    h1: "Interlock Fabric for Stable Apparel Construction",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fabrics/ponte-roma-fabric",
    primaryKeyword: "ponte roma fabric",
    secondaryKeywords: [
      "Ponte Roma fabric supplier",
      "Ponte knit fabric",
      "Ponte fabric manufacturer",
    ],
    searchIntent: "commercial",
    topicCluster: "product-double-knit",
    targetPageType: "service",
    metaTitle: "Ponte Roma Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Ponte Roma fabric sourcing for dresses, trousers, skirts and structured knitwear. Review body, drape, recovery, surface, composition, GSM and usable width, then request a finished sample and confirm colour, testing and commercial terms.",
    h1: "Ponte Roma Fabric for Structured Knitwear",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fabrics/scuba-air-layer-fabric",
    primaryKeyword: "scuba knit fabric",
    secondaryKeywords: [
      "scuba knit fabric supplier",
      "scuba fabric manufacturer",
      "structured double knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-structured-knit",
    targetPageType: "service",
    metaTitle: "Scuba Knit Fabric Supplier | O'range Textile",
    metaDescription:
      "Scuba knit fabric sourcing for apparel programs that need clean structure, resilient body and shape retention. Compare the documented air-layer and double-knit directions, then approve thickness, stretch, finish and garment behaviour on a sample.",
    h1: "Scuba Knit Fabric for Shape-Retaining Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/fabrics/jacquard-knit-fabric",
    primaryKeyword: "jacquard knit fabric",
    secondaryKeywords: [
      "jacquard knit fabric supplier",
      "knit jacquard manufacturer",
      "patterned knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-jacquard",
    targetPageType: "service",
    metaTitle: "Jacquard Knit Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Jacquard knit fabric development for patterned apparel, panels and statement garments. Compare motif scale, face and reverse, composition, GSM, usable width and finishing, then send the design direction for finished-sample and quotation review.",
    h1: "Jacquard Knit Fabric for Patterned Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fabrics/wool-blend-knit-fabric",
    primaryKeyword: "wool blend knit fabric",
    secondaryKeywords: [
      "wool blend fabric supplier",
      "wool knit fabric manufacturer",
      "cashmere-feel knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-wool-blend",
    targetPageType: "service",
    metaTitle: "Wool Blend Knit Fabric Supplier | O'range Textile",
    metaDescription:
      "Wool blend knit fabric sourcing for warm, structured and soft-hand apparel programs. Review the documented fibre blend, article, GSM, usable width and surface direction, then approve hand feel, colour, finish and performance on the offered sample.",
    h1: "Wool Blend Knit Fabric for Warm Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/rib-knit-fabric",
    primaryKeyword: "rib knit fabric",
    secondaryKeywords: [
      "rib knit fabric supplier",
      "rib fabric manufacturer",
      "ribbing fabric for apparel",
    ],
    searchIntent: "commercial",
    topicCluster: "product-rib",
    targetPageType: "service",
    metaTitle: "Rib Knit Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Rib knit fabric development for fitted garments, collars, cuffs, waistbands and coordinated trims. Compare rib geometry, stretch, recovery, GSM, usable width and colour matching, then send the body-fabric and garment requirements for sampling.",
    h1: "Rib Knit Fabric for Apparel and Trims",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/blog",
    primaryKeyword: "knit fabric buyer guides",
    secondaryKeywords: [
      "fabric sourcing guide",
      "knit fabric guide",
      "apparel textile sourcing",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education",
    targetPageType: "guide",
    metaTitle: "Knit Fabric Buyer Guides | O'range Textile",
    metaDescription:
      "Knit fabric buyer guides for global apparel sourcing teams comparing double knit, interlock, Ponte Roma, scuba, rib and jacquard constructions. Use the practical checks to prepare a sample brief, evaluate evidence and continue to the relevant supplier page.",
    h1: "Knit Fabric Buyer Guides for Sourcing Teams",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/blog/what-is-double-knit-fabric",
    primaryKeyword: "what is double knit fabric",
    secondaryKeywords: [
      "double knit fabric meaning",
      "double knit construction",
      "double knit fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-double-knit",
    targetPageType: "blog",
    metaTitle:
      "What Is Double Knit Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is double knit fabric, and how should an apparel buyer evaluate it? Learn how two needle systems create a stable knit family, compare common constructions and uses, then review composition, GSM, width, stretch, recovery and the finished sample before sourcing.",
    h1: "What Is Double Knit Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-interlock-fabric",
    primaryKeyword: "what is interlock fabric",
    secondaryKeywords: [
      "interlock knit construction",
      "interlock vs jersey fabric",
      "interlock fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-double-knit",
    targetPageType: "blog",
    metaTitle:
      "What Is Interlock Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is interlock fabric, and when does it suit an apparel program? Understand its double-knit construction, smooth faces, stability and typical uses, then compare composition, GSM, width, stretch, recovery and sample performance before choosing a supplier route.",
    h1: "What Is Interlock Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-ponte-fabric",
    primaryKeyword: "what is ponte fabric",
    secondaryKeywords: [
      "Ponte Roma fabric meaning",
      "Ponte knit construction",
      "Ponte fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-double-knit",
    targetPageType: "blog",
    metaTitle: "What Is Ponte Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is Ponte fabric, and why is it used for structured knitwear? Review Ponte Roma body, drape, stretch, recovery and garment applications, then compare composition, GSM, usable width, surface and finished-sample behaviour before sourcing.",
    h1: "What Is Ponte Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-scuba-knit-fabric",
    primaryKeyword: "what is scuba knit fabric",
    secondaryKeywords: [
      "scuba fabric meaning",
      "scuba knit construction",
      "scuba vs neoprene fabric",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-structured-knit",
    targetPageType: "blog",
    metaTitle:
      "What Is Scuba Knit Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is scuba knit fabric, and how does it differ from neoprene or air-layer naming? Review structure, thickness, compression, recovery and apparel uses, then confirm the exact construction, composition, GSM, width and finished-sample behaviour.",
    h1: "What Is Scuba Knit Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-rib-knit-fabric",
    primaryKeyword: "what is rib knit fabric",
    secondaryKeywords: [
      "rib knit construction",
      "rib fabric stretch",
      "rib knit fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-rib",
    targetPageType: "blog",
    metaTitle:
      "What Is Rib Knit Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is rib knit fabric, and why does its alternating knit-and-purl geometry affect stretch and recovery? Review common apparel and trim uses, then compare rib ratio, composition, GSM, usable width, colour matching and finished-sample performance.",
    h1: "What Is Rib Knit Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/jacquard-knit-vs-woven-jacquard",
    primaryKeyword: "jacquard knit vs woven jacquard",
    secondaryKeywords: [
      "knitted jacquard vs woven jacquard",
      "jacquard fabric comparison",
      "knit vs woven jacquard",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-comparison-jacquard",
    targetPageType: "blog",
    metaTitle:
      "Jacquard Knit vs Woven Jacquard: Buyer Guide | O'range Textile",
    metaDescription:
      "Jacquard knit vs woven jacquard compares two pattern-forming routes with different stretch, structure, edge behaviour and apparel uses. Learn what buyers should inspect on the face and reverse, then confirm composition, weight, width, motif scale and finish.",
    h1: "Jacquard Knit vs Woven Jacquard for Apparel Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/air-layer-knit-fabric-sourcing-guide",
    primaryKeyword: "air layer knit fabric sourcing guide",
    secondaryKeywords: [
      "air-layer fabric articles",
      "structured knit sourcing",
      "air-layer GSM and width",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-structured-knit",
    targetPageType: "blog",
    metaTitle:
      "Air Layer Knit Fabric Sourcing Guide | O'range Textile",
    metaDescription:
      "Air layer knit fabric sourcing guide for comparing documented articles such as GD2515 and GD2672, with practical checks for composition, 260–300 GSM directions, usable width, structure, recovery, seams, sample approval, and commercial confirmation.",
    h1: "Air Layer Knit Fabric Sourcing Guide for Apparel Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/how-to-source-wool-blend-knit-fabric",
    primaryKeyword: "how to source wool blend knit fabric",
    secondaryKeywords: [
      "wool blend fabric supplier",
      "brushed wool knit sourcing",
      "wool blend sample approval",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-wool-blend",
    targetPageType: "blog",
    metaTitle:
      "How to Source Wool Blend Knit Fabric | O'range Textile",
    metaDescription:
      "How to source wool blend knit fabric using article-level composition evidence, hand and surface review, GSM, usable width, brushing, pilling, colourfastness, care, garment testing, sample approval, and commercial confirmation before production.",
    h1: "How to Source Wool Blend Knit Fabric with Verifiable Evidence",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/jacquard-knit-fabric-weight-and-width-guide",
    primaryKeyword: "jacquard knit fabric weight and width",
    secondaryKeywords: [
      "jacquard knit GSM",
      "jacquard usable width",
      "jacquard article specification",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-jacquard",
    targetPageType: "blog",
    metaTitle:
      "Jacquard Knit Fabric Weight and Width | O'range Textile",
    metaDescription:
      "Jacquard knit fabric weight and width guide using article GD2579 at 240 GSM and GD2683 at 280 GSM with 160–165 cm references, plus repeat, reverse, finish, usable width, cutting yield, sample approval, and commercial confirmation.",
    h1: "Jacquard Knit Fabric Weight and Width for RFQ Planning",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/brushed-and-pile-knit-fabric-finishes",
    primaryKeyword: "brushed knit fabric finishes",
    secondaryKeywords: [
      "pile knit fabric",
      "raised surface knit",
      "brushed fabric sourcing",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-surface-finishes",
    targetPageType: "blog",
    metaTitle: "Brushed Knit Fabric Finishes | O'range Textile",
    metaDescription:
      "Brushed knit fabric finishes guide for comparing faux-cashmere, acetate-brushed, and raised-pile directions, with buyer checks for face and reverse, shedding, pilling, GSM, usable width, colour, care, sample approval, and commercial confirmation.",
    h1: "Brushed Knit Fabric Finishes and Raised-Pile Sourcing Checks",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/how-to-write-a-knit-fabric-rfq",
    primaryKeyword: "knit fabric RFQ template",
    secondaryKeywords: [
      "fabric quotation request",
      "knit fabric specification sheet",
      "sample request brief",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-procurement",
    targetPageType: "blog",
    metaTitle:
      "Knit Fabric RFQ Template for Buyers | O'range Textile",
    metaDescription:
      "Knit fabric RFQ template for apparel buyers who need to state construction, article reference, composition, GSM, usable width, colour, finish, testing, quantity, destination, sample approval, packing, documentation, and commercial confirmation.",
    h1: "Knit Fabric RFQ Template for a Complete Sourcing Brief",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/knit-fabric-sourcing-questions",
    primaryKeyword: "knit fabric sourcing questions",
    secondaryKeywords: [
      "fabric buyer FAQ",
      "finished knit fabric questions",
      "fabric sample checklist",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education",
    targetPageType: "blog",
    metaTitle: "Knit Fabric Sourcing Questions | O'range Textile",
    metaDescription:
      "Knit fabric sourcing questions answered for apparel buyers comparing construction, composition, GSM, usable width, finish, article evidence, testing, sample approval, live availability, order details, documentation, and commercial confirmation.",
    h1: "Knit Fabric Sourcing Questions for Faster Buyer Decisions",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
] as const satisfies readonly PublicPageSeo[];

const pageSeoByPath = new Map<string, PublicPageSeo>(
  publicPageSeo.map((page) => [page.path, page])
);

export function getAllPublicPageSeo(): readonly PublicPageSeo[] {
  return publicPageSeo;
}

export function getPublicPageSeo(path: string): PublicPageSeo {
  const page = pageSeoByPath.get(path);
  if (!page) {
    throw new Error(`Missing public SEO record for ${path}`);
  }
  return page;
}

export function toCanonicalUrl(path: string): string {
  if (path === "/") {
    return SEO_SITE_ORIGIN;
  }
  return new URL(path, `${SEO_SITE_ORIGIN}/`).toString();
}
