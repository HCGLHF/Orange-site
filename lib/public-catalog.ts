import type { Fabric } from "@/lib/data";

export type FabricCategory = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  metaDescription: string;
  buyerIntent: string[];
  applications: string[];
  relatedFabricIds: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const publicFabrics: Fabric[] = [
  {
    id: "cotton-jersey-32s",
    name: "32S combed cotton single jersey",
    composition: "100% combed cotton",
    weight: 160,
    width: 175,
    stockStatus: "In stock",
    tags: ["Cotton jersey", "T-shirt fabric", "Breathable"],
    textureImage: "",
    sceneImage: "",
    description:
      "Soft, breathable combed cotton jersey for T-shirts, base layers and private-label basics.",
    scenarios: ["T-shirt", "Private-label apparel", "Loungewear"],
  },
  {
    id: "cotton-spandex-jersey-32s",
    name: "32S cotton spandex jersey",
    composition: "95% cotton / 5% spandex",
    weight: 180,
    width: 170,
    stockStatus: "In stock",
    tags: ["Cotton spandex jersey", "Stretch knit", "Soft recovery"],
    textureImage: "",
    sceneImage: "",
    description:
      "Cotton-rich stretch jersey with reliable recovery for fitted tees, childrenswear and comfort apparel.",
    scenarios: ["T-shirt", "Childrenswear", "Sportswear"],
  },
  {
    id: "rib-knit-cotton-spandex",
    name: "Cotton spandex rib knit",
    composition: "96% cotton / 4% spandex",
    weight: 220,
    width: 150,
    stockStatus: "Preorder",
    tags: ["Rib knit", "Trim fabric", "Stretch"],
    textureImage: "",
    sceneImage: "",
    description:
      "Elastic rib knit for collars, cuffs, tanks, fitted tops and trim applications.",
    scenarios: ["T-shirt", "Casual apparel", "Private-label apparel"],
  },
  {
    id: "fleece-french-terry-cotton-poly",
    name: "Cotton polyester French terry fleece",
    composition: "70% cotton / 30% polyester",
    weight: 280,
    width: 175,
    stockStatus: "Preorder",
    tags: ["French terry", "Fleece", "Hoodie fabric"],
    textureImage: "",
    sceneImage: "",
    description:
      "Comfort-focused French terry fleece for hoodies, sweatshirts and casualwear programs.",
    scenarios: ["Hoodie", "Sweatshirt", "Loungewear"],
  },
  {
    id: "scuba-air-layer-knit",
    name: "Poly-cotton scuba air-layer knit",
    composition: "65% polyester / 35% cotton",
    weight: 260,
    width: 165,
    stockStatus: "Preorder",
    tags: ["Scuba knit", "Air-layer knit", "Structured"],
    textureImage: "",
    sceneImage: "",
    description:
      "Structured air-layer knit with a stable body for hoodies, jackets and garments that need shape retention.",
    scenarios: ["Hoodie", "Jacket", "Outerwear"],
  },
];

export const publicFabricCategories: FabricCategory[] = [
  {
    slug: "cotton-jersey",
    name: "Cotton jersey fabrics",
    shortName: "Cotton jersey",
    description:
      "Soft, breathable knitted fabrics for T-shirts, base layers and everyday apparel programs.",
    metaDescription:
      "Source cotton jersey fabrics from O'range Textile, a Shaoxing Keqiao knit fabric manufacturer for T-shirts, basics and private-label apparel.",
    buyerIntent: [
      "cotton jersey fabric manufacturer China",
      "T-shirt fabric supplier Shaoxing",
      "combed cotton single jersey for apparel brands",
    ],
    applications: ["T-shirts", "Base layers", "Loungewear", "Private-label basics"],
    relatedFabricIds: ["cotton-jersey-32s"],
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
    buyerIntent: [
      "cotton spandex jersey fabric supplier",
      "stretch cotton knit fabric manufacturer",
      "95 cotton 5 spandex jersey fabric",
    ],
    applications: ["Fitted T-shirts", "Childrenswear", "Sportswear", "Loungewear"],
    relatedFabricIds: ["cotton-spandex-jersey-32s", "rib-knit-cotton-spandex"],
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
    buyerIntent: [
      "French terry fabric manufacturer China",
      "hoodie fleece fabric supplier",
      "sweatshirt knit fabric sourcing",
    ],
    applications: ["Hoodies", "Sweatshirts", "Streetwear", "Loungewear"],
    relatedFabricIds: ["fleece-french-terry-cotton-poly"],
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
    buyerIntent: [
      "scuba knit fabric supplier",
      "air-layer knit fabric manufacturer China",
      "structured hoodie fabric sourcing",
    ],
    applications: ["Hoodies", "Jackets", "Outerwear", "Structured casualwear"],
    relatedFabricIds: ["scuba-air-layer-knit"],
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
