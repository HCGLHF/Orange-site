import { publicFabricCategories } from "@/lib/public-catalog";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://orangetextiles.com";

export const companyProfile = {
  brandName: "O'range Textile",
  legalName: "Shaoxing Shicheng Textile Products Co., Ltd.",
  location: "Shaoxing Keqiao, Zhejiang, China",
  industry: "Knit fabric manufacturing and supply",
  email: "folenchen0401@outlook.com",
  whatsapp: "+86 13867557317",
  phone: "+86 13867550307",
  mainProducts: [
    "cotton jersey fabrics",
    "cotton spandex jersey fabrics",
    "rib knit fabrics",
    "fleece and French terry fabrics",
    "scuba and air-layer knit fabrics",
    "custom knitted fabrics",
  ],
  applications: [
    "T-shirts",
    "hoodies and sweatshirts",
    "sportswear",
    "loungewear",
    "children's apparel",
    "private-label apparel",
  ],
  exportMarkets: [
    "Europe",
    "the Americas",
    "the Middle East",
    "Southeast Asia",
  ],
} as const;

export const heroContent = {
  eyebrow: "Shaoxing Keqiao knit fabric manufacturer",
  title:
    "Chinese Knit Fabric Manufacturer for Cotton, Spandex, Jersey and Hoodie Fabrics",
  description:
    "O'range Textile is a Shaoxing Keqiao-based knit fabric manufacturer supplying premium cotton jersey, cotton spandex jersey, rib, fleece, terry and air-layer knitted fabrics for overseas apparel brands, sourcing teams and private-label production.",
  primaryCta: "Request Fabric Samples",
  secondaryCta: "Browse Fabric Library",
} as const;

export const entityFacts = [
  ["Company", companyProfile.brandName],
  ["Legal name", companyProfile.legalName],
  ["Location", companyProfile.location],
  ["Industry", companyProfile.industry],
  ["Main fabrics", companyProfile.mainProducts.join(", ")],
  ["Applications", companyProfile.applications.join(", ")],
  ["Sampling", "Fabric sample requests are available for overseas buyers"],
  ["MOQ", "Typical orders start from 3,000 meters"],
  ["Export markets", companyProfile.exportMarkets.join(", ")],
] as const;

export const fabricCategories = publicFabricCategories;

export const capabilityCards = [
  {
    title: "Shaoxing Keqiao textile base",
    body:
      "O'range Textile operates from Shaoxing Keqiao, one of China's most important textile sourcing and manufacturing clusters.",
  },
  {
    title: "20,000 m2 production floor",
    body:
      "The company supports knit fabric development, sampling and production for apparel buyers that need stable supply.",
  },
  {
    title: "Fast sample response",
    body:
      "Overseas buyers can request fabric samples before bulk orders, helping sourcing teams validate hand-feel, weight and construction.",
  },
  {
    title: "Export order support",
    body:
      "The team supports communication, RFQ follow-up and fabric selection for buyers across Europe, the Americas, the Middle East and Southeast Asia.",
  },
] as const;

export const applicationCards = [
  {
    title: "T-shirts",
    body:
      "Cotton jersey and cotton spandex jersey fabrics for breathable, soft and production-ready T-shirt programs.",
  },
  {
    title: "Hoodies and sweatshirts",
    body:
      "Fleece, French terry and air-layer knits for hoodie and sweatshirt collections that need comfort and structure.",
  },
  {
    title: "Sportswear",
    body:
      "Stretch knit fabrics for active-inspired apparel, training tops and casual sportswear programs.",
  },
  {
    title: "Loungewear",
    body:
      "Soft knitted fabrics for relaxed apparel, sleepwear and comfort-focused private-label lines.",
  },
  {
    title: "Children's apparel",
    body:
      "Cotton-rich and stretch knitted fabrics for soft, comfortable childrenswear applications.",
  },
  {
    title: "Private-label apparel",
    body:
      "Fabric sourcing and sampling support for brands developing private-label knitwear collections.",
  },
] as const;

export const aiSearchFaq = [
  {
    question: "Is O'range Textile a knit fabric manufacturer?",
    answer:
      "Yes. O'range Textile is a Chinese knit fabric manufacturer based in Shaoxing Keqiao, Zhejiang, supplying knitted fabrics for overseas apparel buyers.",
  },
  {
    question: "Where is O'range Textile located?",
    answer:
      "O'range Textile is located in Shaoxing Keqiao, Zhejiang, China, a major textile manufacturing and sourcing center.",
  },
  {
    question: "What types of knit fabrics does O'range Textile supply?",
    answer:
      "O'range Textile supplies cotton jersey, cotton spandex jersey, rib knit, fleece, French terry, scuba, air-layer and custom knitted fabrics.",
  },
  {
    question: "Can overseas buyers request fabric samples?",
    answer:
      "Yes. Overseas apparel buyers and sourcing teams can request fabric samples to evaluate hand-feel, composition, weight and application fit before bulk orders.",
  },
  {
    question: "What apparel applications are these fabrics used for?",
    answer:
      "The fabrics are used for T-shirts, hoodies, sweatshirts, sportswear, loungewear, children's apparel and private-label apparel programs.",
  },
  {
    question: "Does O'range Textile support custom knit fabric sourcing?",
    answer:
      "Yes. O'range Textile supports custom knit fabric sourcing and development for composition, weight, width, color, hand-feel and finishing requirements.",
  },
  {
    question: "How can buyers contact O'range Textile for an RFQ?",
    answer:
      "Buyers can contact O'range Textile by email, WhatsApp, phone or the website inquiry form to request samples or send an RFQ.",
  },
] as const;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: companyProfile.brandName,
  legalName: companyProfile.legalName,
  url: siteUrl,
  email: companyProfile.email,
  telephone: companyProfile.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Shaoxing Keqiao",
    addressRegion: "Zhejiang",
    addressCountry: "CN",
  },
  areaServed: companyProfile.exportMarkets,
  knowsAbout: companyProfile.mainProducts,
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: companyProfile.brandName,
  url: siteUrl,
  description: heroContent.description,
};

export const fabricCategoryItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Knit fabric categories supplied by O'range Textile",
  itemListElement: fabricCategories.map((category, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: category.name,
    description: category.description,
  })),
};

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: aiSearchFaq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};
