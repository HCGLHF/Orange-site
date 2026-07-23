import { manufacturingScale } from "../lib/company-evidence.ts";

/**
 * MANUAL LANDING PAGE CONTENT ENTRY
 *
 * Review and edit the four records in this file before merging the test branch.
 * Components read public copy from here; editorNotes are deliberately removed
 * by getPublicLandingPage and never render on the website.
 */
export const landingPageKeys = [
  "home",
  "readyStock",
  "finishedDoubleKnit",
  "customDevelopment",
] as const;

export type LandingPageKey = (typeof landingPageKeys)[number];

export type LandingProofPoint = {
  label: string;
  value: string;
  enabled: boolean;
};

export type LandingContentBlock = {
  title: string;
  body: string;
  enabled: boolean;
};

export type LandingProcessStep = {
  title: string;
  body: string;
};

export type LandingFaq = {
  question: string;
  answer: string;
};

export type LandingPageRecord = {
  purpose: string;
  eyebrow: string;
  headline: string;
  summary: string;
  heroImage: {
    src: string;
    alt: string;
  };
  proofPoints: LandingProofPoint[];
  advantages: LandingContentBlock[];
  checklist: string[];
  process: LandingProcessStep[];
  faq: LandingFaq[];
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  editorNotes: string[];
};

export type PublicLandingPage = Omit<LandingPageRecord, "editorNotes">;

export const landingPages: Record<LandingPageKey, LandingPageRecord> = {
  home: {
    purpose: "Present the integrated production route and direct overseas buyers to the right inquiry path.",
    eyebrow: "Integrated knit fabric and garment supply in Shaoxing Keqiao",
    headline: "From Greige Fabric to Finished Fabric and Garment Supply",
    summary:
      "Current export sales are centered on finished fabrics, while the production route can continue from greige fabric through finished fabric to finished garment supply. Overseas fabric buyers, apparel teams and sourcing companies can begin with a documented article, a reference sample or a specification-led inquiry.",
    heroImage: {
      src: "/images/finished-fabrics/finished-double-knit-factory.webp",
      alt: "Finished double-knit fabric rolls and swatches in front of circular knitting machines",
    },
    proofPoints: [
      { label: "Location", value: "Shaoxing Keqiao, China", enabled: true },
      { label: "Production route", value: "Greige fabric, finished fabric and garments", enabled: true },
      { label: "Machine evidence", value: `${manufacturingScale[0].value} documented circular knitting machines`, enabled: true },
      { label: "Export experience", value: "Asia, Europe, the Americas and Russia", enabled: true },
    ],
    advantages: [
      {
        title: "An integrated production route",
        body: "The current export offer focuses on finished fabrics, but the production chain can connect greige fabric, finished fabric and finished garment requirements within one sourcing conversation.",
        enabled: true,
      },
      {
        title: "Experience across buyer markets",
        body: "Completed export business has included buyers in Bangladesh, Russia, Nepal, Europe, the United States and South America, supporting both fabric and apparel enquiries.",
        enabled: true,
      },
      {
        title: "Documentation available when relevant",
        body: "GRS documentation can be reviewed for applicable recycled-fibre programmes. Scope, transaction coverage and supporting files are confirmed for the specific order during the inquiry process.",
        enabled: true,
      },
    ],
    checklist: [],
    process: [],
    faq: [],
    primaryCta: { label: "Send a fabric or garment inquiry", href: "/fabrics#inquiry-form" },
    secondaryCta: { label: "Review 104 finished-fabric articles", href: "/finished-double-knit-fabrics" },
    editorNotes: [
      "The integrated greige-to-garment route and export markets were supplied by the business owner for this review.",
      "Do not publish customer names or transaction values without separate approval.",
      "Keep GRS language conditional on the applicable order and available transaction documentation.",
    ],
  },
  readyStock: {
    purpose: "Help a buyer review documented finished-fabric articles and move to a private inquiry.",
    eyebrow: "Finished fabrics available for inquiry",
    headline: "Finished Fabric Articles for Sample and RFQ Review",
    summary:
      "The current catalogue contains 104 documented finished-fabric articles across 11 series. Review the listed construction, composition, GSM and usable width, then contact the sourcing team to confirm the exact article, colour and quantity. Greige fabric and finished garment requirements can also be discussed through a private inquiry.",
    heroImage: {
      src: "/images/finished-fabrics/double-knit-interlock-comparison.webp",
      alt: "Finished knit fabric swatches prepared for stock and sample comparison",
    },
    proofPoints: [
      { label: "Catalogue", value: "104 documented finished-fabric articles", enabled: true },
      { label: "Product families", value: "11 documented finished-fabric series", enabled: true },
      { label: "Specification", value: "Composition, GSM and width by article", enabled: true },
      { label: "Additional scope", value: "Greige fabric and garments by inquiry", enabled: true },
    ],
    advantages: [
      {
        title: "Start from a real article",
        body: "The catalogue provides article numbers and documented material, weight and width fields so the buyer can begin with a concrete sourcing reference.",
        enabled: true,
      },
      {
        title: "Confirm the order privately",
        body: "Exact colour, quantity, finishing and commercial terms are confirmed with the sales team for the current enquiry rather than published as fixed promises.",
        enabled: true,
      },
      {
        title: "Ask beyond finished fabric",
        body: "Buyers who need greige fabric or finished garments can use the same contact route and provide the relevant specification or garment brief.",
        enabled: true,
      },
    ],
    checklist: [
      "Confirm construction and exact composition.",
      "Confirm GSM, usable width, colour and finish.",
      "State required quantity, destination and documentation needs.",
      "Reference the exact article or add it to the inquiry list.",
    ],
    process: [],
    faq: [
      {
        question: "Does a listed article guarantee the requested colour and quantity?",
        answer: "No. The catalogue confirms an active product direction. Exact colour, quantity, finishing and commercial terms are confirmed privately for the current inquiry.",
      },
      {
        question: "Can buyers request a physical sample first?",
        answer: "Yes. Include the garment use and the properties that need to be evaluated so the team can identify a relevant sample.",
      },
      {
        question: "What should be included in a stock-fabric RFQ?",
        answer: "Include the article, colour, quantity, destination and any testing, packing or documentation requirements. The sales team will confirm the next step directly.",
      },
      {
        question: "Can buyers ask about greige fabric or finished garments?",
        answer: "Yes. Those requirements are handled through a direct inquiry because the required construction, garment brief and commercial scope need to be reviewed privately.",
      },
    ],
    primaryCta: { label: "Ask about a finished-fabric article", href: "/fabrics?stock=in-stock#inquiry-form" },
    secondaryCta: { label: "Need a custom article?", href: "/custom-knit-fabric-development" },
    editorNotes: [
      "Do not add a stock-update block until the customer supplies and owns that field.",
      "Keep fulfilment timing private and confirm it by destination and order.",
      "The 104 documented articles come from the supplied finished-fabric workbook.",
    ],
  },
  finishedDoubleKnit: {
    purpose: "Help buyers review 11 documented finished-fabric series and choose an article for inquiry.",
    eyebrow: "104 articles across 11 finished-fabric series",
    headline: "Finished Double-Knit and Specialty Knit Fabric Catalogue",
    summary:
      "Review air-layer, yarn-dyed wool-blend air-layer, structured polyester-viscose, faux-cashmere, acrylic-wool, lyocell-acetate-wool, brushed, raised-pile, cashmere-blend and jacquard directions. Representative articles show composition, GSM and usable width from the supplied catalogue.",
    heroImage: {
      src: "/images/finished-fabrics/ponte-scuba-apparel-development.webp",
      alt: "Finished Ponte Roma and scuba-style knit fabrics prepared for apparel development",
    },
    proofPoints: [
      { label: "Product range", value: "11 documented finished-fabric series", enabled: true },
      { label: "Catalogue evidence", value: "104 supplied finished-fabric records", enabled: true },
      { label: "Machine evidence", value: "Double-knit and rib configurations", enabled: true },
      { label: "Decision", value: "Article confirmed by sample and specification", enabled: true },
    ],
    advantages: [
      {
        title: "Article-level specifications",
        body: "Representative catalogue records include article number, material composition, GSM and usable width for a more concrete sourcing discussion.",
        enabled: true,
      },
      {
        title: "Broad surface and fibre directions",
        body: "The range spans air-layer, structured, brushed, raised-pile, cashmere-blend, wool-blend and jacquard finished-knit directions.",
        enabled: true,
      },
      {
        title: "Private confirmation before order",
        body: "The selected article, colour, quantity, finish and commercial terms are confirmed directly with the sourcing team.",
        enabled: true,
      },
    ],
    checklist: [
      "Reference the article number or closest product series.",
      "State the garment use and the properties that matter most.",
      "Confirm target composition, GSM, usable width and finish.",
      "Share quantity, destination, testing and documentation requirements.",
    ],
    process: [
      { title: "Choose a series", body: "Use the catalogue table to identify a relevant construction and article direction." },
      { title: "Send an inquiry", body: "Share the article reference, garment use, quantity and destination with the sourcing team." },
      { title: "Confirm privately", body: "Review the exact specification, sample route and commercial terms directly with sales." },
    ],
    faq: [
      {
        question: "Are all 104 catalogue records finished fabrics?",
        answer: "Yes. The supplied workbook is the current finished-fabric catalogue used for this page. Exact order details still require direct confirmation.",
      },
      {
        question: "Can buyers ask about an article not shown on the website?",
        answer: "Yes. Send the article number, a screenshot or a reference sample through the inquiry route so the sourcing team can review it.",
      },
      {
        question: "Are greige fabric and garment orders also accepted?",
        answer: "They can be discussed through a private inquiry even though the current public export catalogue is focused on finished fabrics.",
      },
    ],
    primaryCta: { label: "Ask about a catalogue article", href: "/fabrics#inquiry-form" },
    secondaryCta: { label: "Start a custom development brief", href: "/custom-knit-fabric-development" },
    editorNotes: [
      "Keep the 11 product series aligned with the supplied finished-fabric workbook.",
      "Add verified article examples only after composition, GSM and width are checked.",
      "Do not convert machine capability into guaranteed article performance.",
    ],
  },
  customDevelopment: {
    purpose: "Direct fabric and garment requirements to a private sales inquiry.",
    eyebrow: "Private fabric and garment inquiry",
    headline: "Send a Knit Fabric or Garment Requirement for Review",
    summary:
      "Use the inquiry route for greige fabric, finished fabric or finished garment requirements that need direct review. Share the product or garment brief, composition, GSM, width, colour, finish, quantity and destination by email, WhatsApp, phone or the website inquiry entry.",
    heroImage: {
      src: "/images/finished-fabrics/finished-fabric-sample-inspection.webp",
      alt: "Finished fabric samples being checked against an apparel development brief",
    },
    proofPoints: [
      { label: "Scope", value: "Greige, finished fabric or garments", enabled: true },
      { label: "Contact", value: "Email, WhatsApp, phone or website inquiry", enabled: true },
      { label: "Review", value: "Requirement checked directly by sales", enabled: true },
      { label: "Terms", value: "Confirmed privately for the current order", enabled: true },
    ],
    advantages: [
      {
        title: "One direct inquiry route",
        body: "Fabric and garment requirements can enter through the same contact path and then be assigned to the relevant sourcing discussion.",
        enabled: true,
      },
      {
        title: "Specification-led review",
        body: "The sales team reviews the article reference, garment use, composition, GSM, width, finish, quantity and destination before confirming a route.",
        enabled: true,
      },
      {
        title: "Commercial details stay current",
        body: "Samples, quantity, order terms and supporting documentation are discussed privately for the actual requirement instead of published as fixed promises.",
        enabled: true,
      },
    ],
    checklist: [
      "Greige fabric, finished fabric or finished garment requirement.",
      "Construction, composition and stretch requirements.",
      "Target GSM, usable width, colour, surface and finish.",
      "Quantity, destination, sample deadline and testing needs.",
    ],
    process: [
      { title: "Send the inquiry", body: "Use email, WhatsApp, phone or the website entry and attach the available article or garment brief." },
      { title: "Review with sales", body: "The sourcing team checks the product scope, specification and information gaps directly with the buyer." },
      { title: "Confirm the next step", body: "Sample, quotation and order details are agreed privately for the current requirement." },
    ],
    faq: [
      {
        question: "Can buyers inquire about greige fabric, finished fabric and garments?",
        answer: "Yes. The public catalogue focuses on finished fabrics, while greige fabric and finished garment requirements can be reviewed through a direct inquiry.",
      },
      {
        question: "How should buyers send the requirement?",
        answer: "Use email, WhatsApp, phone or the website inquiry entry. Include an article number, reference image, fabric specification or garment brief when available.",
      },
      {
        question: "Are quantity and order terms published on this page?",
        answer: "No. They depend on the actual fabric or garment requirement and are confirmed privately by the sales team for the current inquiry.",
      },
    ],
    primaryCta: { label: "Send a sourcing inquiry", href: "/fabrics#inquiry-form" },
    secondaryCta: { label: "Open direct contact options", href: "/#contact" },
    editorNotes: [
      "This page intentionally routes operational details to a private inquiry.",
      "Do not add response timing until the sales owner accepts a public commitment.",
      "Keep quantity, order terms and documentation conditional on the exact requirement.",
    ],
  },
};

export function getPublicLandingPage(key: LandingPageKey): PublicLandingPage {
  const { editorNotes, ...publicContent } = landingPages[key];
  void editorNotes;
  return publicContent;
}
