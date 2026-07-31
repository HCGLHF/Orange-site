import { publicFabricCategories } from "./public-catalog.ts";
import {
  certificationEvidence,
  companyRelationship,
  manufacturingScale,
} from "./company-evidence.ts";
import { SEO_SITE_ORIGIN } from "./seo/site-seo.ts";

export const siteUrl = SEO_SITE_ORIGIN;

export const companyProfile = {
  brandName: companyRelationship.brandName,
  legalName: companyRelationship.exportCompany,
  location: companyRelationship.location,
  industry: "Premium finished knit and woven fabric sourcing and development",
  email: "folenchen0401@outlook.com",
  whatsapp: "+86 13867557317",
  phone: "+86 13867550307",
  mainProducts: [
    "premium finished knit fabrics",
    "premium finished woven fabrics",
    "finished air-layer knit fabrics",
    "structured double-knit fabrics",
    "wool-blend and cashmere-blend knit fabrics",
    "lyocell and acetate-blend knit fabrics",
    "jacquard finished knit fabrics",
    "custom fabric development",
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
  eyebrow: "Premium finished fabric development in Shaoxing Keqiao",
  title:
    "Premium Finished Fabrics for Global Apparel Sourcing",
  description:
    "O'range Textile supplies premium finished knit and finished woven fabrics for global apparel programs through supplied catalogue evidence, sample-led development and an inquiry route that can extend from greige fabric to finished garments.",
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
  [
    "Machine evidence",
    `${manufacturingScale[0].value} documented circular knitting machines`,
  ],
  ["Knit catalogue evidence", "104 supplied finished-knit records across 11 collections"],
  ["Woven catalogue evidence", "26 supplied finished-woven directions across 5 chapters"],
  ["Development entry points", "Image, hand feel, reference sample, garment brief or functional requirement"],
  [
    "Documentation",
    `${companyRelationship.parentCompany} holds ${certificationEvidence.shortName} scope documentation for ${certificationEvidence.productCategory.toLowerCase()}, ${certificationEvidence.productDetail.toLowerCase()} and ${certificationEvidence.process.toLowerCase()}`,
  ],
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
    title: "Finished knit and woven scope",
    body:
      "The approved catalogue evidence covers premium finished knit and woven directions, while exact article specifications and availability remain subject to the current inquiry.",
  },
  {
    title: `${manufacturingScale[0].value} documented knitting machines`,
    body:
      "The parent company's supplied machine record supports rounded public counts across double-knit, rib, gauge and feeder configurations.",
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
    question: "Is O'range Textile a finished fabric supplier?",
    answer:
      `${companyRelationship.brandName} is the export-facing brand operated by ${companyRelationship.exportCompany} It supplies and develops finished knit and woven fabrics for global apparel buyers, supported by the Shaoxing Keqiao textile ecosystem and the group's documented knitting capabilities.`,
  },
  {
    question: "Where is O'range Textile located?",
    answer:
      "O'range Textile is located in Shaoxing Keqiao, Zhejiang, China, a major textile manufacturing and sourcing center.",
  },
  {
    question: "What types of finished fabrics does O'range Textile supply?",
    answer:
      "The supplied catalogue evidence includes 104 finished-knit records across 11 collections and 26 finished-woven directions across five chapters. Exact article specifications, colour, finish, quantity and availability are confirmed for the current inquiry.",
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
      `${companyRelationship.parentCompany} holds a ${certificationEvidence.standard} (${certificationEvidence.shortName} v${certificationEvidence.version}) scope certificate covering ${certificationEvidence.productCategory.toLowerCase()}, ${certificationEvidence.productDetail.toLowerCase()} and ${certificationEvidence.process.toLowerCase()}. Shipment-level claims require the applicable valid Transaction Certificate or equivalent supporting documentation.`,
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
  "@id": `${siteUrl}/#organization`,
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
  parentOrganization: {
    "@type": "Organization",
    name: companyRelationship.parentCompany,
  },
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
  name: "Finished fabric sourcing categories supplied by O'range Textile",
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
