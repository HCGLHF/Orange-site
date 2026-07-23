import { publicFabricCategories } from "@/lib/public-catalog";
import {
  SEO_BRAND_NAME,
  SEO_SITE_ORIGIN,
} from "@/lib/seo/site-seo";

export const siteUrl = SEO_SITE_ORIGIN;

export const companyProfile = {
  brandName: SEO_BRAND_NAME,
  legalName: "Shaoxing Shicheng Textile Products Co., Ltd.",
  location: "Shaoxing Keqiao, Zhejiang, China",
  industry: "Integrated knit fabric, finished fabric and garment supply",
  email: "folenchen0401@outlook.com",
  whatsapp: "+86 13867557317",
  phone: "+86 13867550307",
  mainProducts: [
    "finished air-layer knit fabrics",
    "structured double-knit fabrics",
    "wool-blend and cashmere-blend knit fabrics",
    "lyocell and acetate-blend knit fabrics",
    "jacquard finished knit fabrics",
    "greige fabric and garment enquiries",
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
    "Bangladesh",
    "Russia",
    "Nepal",
    "Europe",
    "the United States",
    "South America",
  ],
} as const;

export const heroContent = {
  eyebrow: "Integrated knit fabric and garment supply in Shaoxing Keqiao",
  title:
    "From Greige Fabric to Finished Fabric and Garment Supply",
  description:
    "O'range Textile's current export offer is centred on 104 documented finished-fabric articles, supported by an integrated sourcing route that can extend from greige fabric through finishing to finished garments.",
  primaryCta: "Send a Sourcing Inquiry",
  secondaryCta: "Review Finished Fabrics",
} as const;

export const entityFacts = [
  ["Company", companyProfile.brandName],
  ["Legal name", companyProfile.legalName],
  ["Location", companyProfile.location],
  ["Industry", companyProfile.industry],
  ["Production route", "Greige fabric, finished fabric and finished garments"],
  ["Main fabrics", companyProfile.mainProducts.join(", ")],
  ["Applications", companyProfile.applications.join(", ")],
  ["Machine evidence", "221 documented circular knitting machines"],
  ["Catalogue", "104 documented finished-fabric articles across 11 series"],
  ["Documentation", "GRS documentation can be reviewed for applicable orders"],
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
    title: "Integrated production route",
    body:
      "The sourcing scope can connect greige fabric, finished fabric and finished garment requirements, while the current public export catalogue remains focused on finished fabrics.",
  },
  {
    title: "221 documented knitting machines",
    body:
      "The supplied machine record documents 177 double-knit machines and 44 rib machines across multiple diameters, gauges and feed configurations.",
  },
  {
    title: "Export-market experience",
    body:
      "Completed business has included buyers in Bangladesh, Russia, Nepal, Europe, the United States and South America. Exact order scope is reviewed by inquiry.",
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
      "Yes. O'range Textile is based in Shaoxing Keqiao, Zhejiang, and supports an integrated route from greige fabric through finished fabric to finished garment supply. Current export sales are focused on finished fabrics.",
  },
  {
    question: "Where is O'range Textile located?",
    answer:
      "O'range Textile is located in Shaoxing Keqiao, Zhejiang, China, a major textile manufacturing and sourcing center.",
  },
  {
    question: "What types of knit fabrics does O'range Textile supply?",
    answer:
      "The current catalogue documents 104 finished-fabric articles across 11 series, including air-layer, structured polyester-viscose, wool blends, lyocell-acetate-wool blends, cashmere blends and jacquard directions.",
  },
  {
    question: "Can overseas buyers ask about greige fabric or finished garments?",
    answer:
      "Yes. The public catalogue focuses on finished fabrics, while greige fabric and finished garment requirements can be reviewed privately through email, WhatsApp, phone or the website inquiry route.",
  },
  {
    question: "Which export markets has the business served?",
    answer:
      "Completed business has included buyers in Bangladesh, Russia, Nepal, Europe, the United States and South America, covering fabric and apparel sourcing requirements.",
  },
  {
    question: "Is GRS documentation available?",
    answer:
      "GRS documentation can be reviewed for applicable recycled-fibre programmes. Scope, transaction coverage and supporting files are confirmed for the specific order during the inquiry process.",
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
    url: `${siteUrl}/fabrics/${category.slug}`,
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
