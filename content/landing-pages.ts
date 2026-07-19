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
    purpose: "Establish factory trust and route buyers by sourcing intent.",
    eyebrow: "Finished knit fabric manufacturing in Shaoxing Keqiao",
    headline: "Finished Knit Fabrics for Apparel Development and Supply",
    summary:
      "O'range Textile supports overseas apparel teams with finished double-knit fabrics, article selection, sample requests and specification-led RFQs from Shaoxing Keqiao, China.",
    heroImage: {
      src: "/images/finished-fabrics/finished-double-knit-factory.webp",
      alt: "Finished double-knit fabric rolls and swatches in front of circular knitting machines",
    },
    proofPoints: [
      { label: "Location", value: "Shaoxing Keqiao, China", enabled: true },
      { label: "Finished range", value: "Six core double-knit directions", enabled: true },
      { label: "Machine evidence", value: "221 documented circular knitting machines", enabled: true },
      { label: "Buyer route", value: "Samples and specification-led RFQs", enabled: true },
    ],
    advantages: [
      {
        title: "Finished-fabric focus",
        body: "The sourcing route starts with finished fabric hand, surface, weight, usable width and garment behaviour rather than an undefined greige construction.",
        enabled: true,
      },
      {
        title: "Construction options",
        body: "Interlock, Ponte Roma, scuba and air-layer, jacquard, wool-blend and rib directions provide a practical starting point for apparel sampling.",
        enabled: true,
      },
      {
        title: "Evidence-bounded development",
        body: "Article specifications, availability and commercial terms are confirmed against the current sample and quotation instead of fixed in evergreen claims.",
        enabled: true,
      },
    ],
    checklist: [],
    process: [],
    faq: [],
    primaryCta: { label: "Request finished-fabric samples", href: "/fabrics#inquiry-form" },
    secondaryCta: { label: "Explore finished double knits", href: "/finished-double-knit-fabrics" },
    editorNotes: [
      "Replace the headline only after confirming the single strongest factory advantage.",
      "Add customer or market proof only when a publishable source is available.",
      "Review the machine count whenever the supplied equipment sheet changes.",
    ],
  },
  readyStock: {
    purpose: "Help a buyer identify currently listed stock and move to an inquiry.",
    eyebrow: "Ready-stock knit fabric route",
    headline: "In-stock Knit Fabrics for Faster Sample and RFQ Decisions",
    summary:
      "Browse articles currently marked in stock, then confirm colour, quantity, finish, usable width and dispatch timing with the sourcing team before placing an order.",
    heroImage: {
      src: "/images/finished-fabrics/double-knit-interlock-comparison.webp",
      alt: "Finished knit fabric swatches prepared for stock and sample comparison",
    },
    proofPoints: [
      { label: "Status", value: "Shown at article level", enabled: true },
      { label: "Confirmation", value: "Quantity and colour checked per RFQ", enabled: true },
      { label: "Samples", value: "Physical sample requests supported", enabled: true },
      { label: "Specification", value: "Article data confirmed before order", enabled: true },
    ],
    advantages: [],
    checklist: [
      "Confirm construction and exact composition.",
      "Confirm GSM, usable width, colour and finish.",
      "State required quantity, destination and requested timing.",
      "Reference the exact article or add it to the inquiry list.",
    ],
    process: [],
    faq: [
      {
        question: "Does an in-stock label guarantee the requested quantity?",
        answer: "No. The label identifies the current sourcing route. Quantity, colour and dispatch timing must be confirmed in the current quotation.",
      },
      {
        question: "Can buyers request a physical sample first?",
        answer: "Yes. Include the garment use and the properties that need to be evaluated so the team can identify a relevant sample.",
      },
      {
        question: "What should be included in a stock-fabric RFQ?",
        answer: "Include the article, colour, quantity, destination, required date and any testing, packing or documentation requirements.",
      },
    ],
    primaryCta: { label: "Request an in-stock sample", href: "/fabrics?stock=in-stock#inquiry-form" },
    secondaryCta: { label: "Need a custom article?", href: "/custom-knit-fabric-development" },
    editorNotes: [
      "Add a public stock update date only when someone owns the update process.",
      "Do not publish a 24-hour dispatch promise unless the listed article and operational rule support it.",
      "Replace generic availability text with confirmed inventory evidence when available.",
    ],
  },
  finishedDoubleKnit: {
    purpose: "Help buyers select the right finished double-knit construction route.",
    eyebrow: "Finished double-knit selection",
    headline: "Choose a Finished Double-knit Direction for the Garment Brief",
    summary:
      "Compare interlock, Ponte Roma, scuba and air-layer, jacquard, wool-blend and rib directions by structure, stretch, hand, warmth, surface and intended garment use.",
    heroImage: {
      src: "/images/finished-fabrics/ponte-scuba-apparel-development.webp",
      alt: "Finished Ponte Roma and scuba-style knit fabrics prepared for apparel development",
    },
    proofPoints: [
      { label: "Product routes", value: "Six core finished-knit directions", enabled: true },
      { label: "Catalogue evidence", value: "104 supplied finished-fabric records", enabled: true },
      { label: "Machine evidence", value: "Double-knit and rib configurations", enabled: true },
      { label: "Decision", value: "Article confirmed by sample and specification", enabled: true },
    ],
    advantages: [],
    checklist: [],
    process: [],
    faq: [],
    primaryCta: { label: "Request a finished-fabric sample", href: "/fabrics#inquiry-form" },
    secondaryCta: { label: "Start a custom development brief", href: "/custom-knit-fabric-development" },
    editorNotes: [
      "Keep the six product directions aligned with actual export-ready finished fabrics.",
      "Add verified article examples only after composition, GSM and width are checked.",
      "Do not convert machine capability into guaranteed article performance.",
    ],
  },
  customDevelopment: {
    purpose: "Collect a usable fabric-development brief for a non-stock requirement.",
    eyebrow: "Custom knit fabric development",
    headline: "Turn a Garment Requirement into a Reviewable Fabric Brief",
    summary:
      "Share the garment use, construction direction, composition, target GSM, usable width, colour, finish, quantity and destination so the sourcing team can review an article and sample route.",
    heroImage: {
      src: "/images/finished-fabrics/finished-fabric-sample-inspection.webp",
      alt: "Finished fabric samples being checked against an apparel development brief",
    },
    proofPoints: [
      { label: "Input", value: "Garment and specification brief", enabled: true },
      { label: "Review", value: "Construction and article direction", enabled: true },
      { label: "Evidence", value: "Labelled sample and matching data", enabled: true },
      { label: "Commercial terms", value: "Confirmed in the current quotation", enabled: true },
    ],
    advantages: [],
    checklist: [
      "Garment type, panel function and target market.",
      "Construction, composition and stretch requirements.",
      "Target GSM, usable width, colour, surface and finish.",
      "Quantity, destination, sample deadline and testing needs.",
    ],
    process: [
      { title: "Send the brief", body: "Separate fixed requirements from fields where the supplier may propose an option." },
      { title: "Review the route", body: "The sourcing team checks the likely construction, article and information gaps." },
      { title: "Evaluate a sample", body: "Compare the labelled sample, article data and garment-use requirements." },
      { title: "Confirm the order basis", body: "Approve one documented version and confirm commercial terms in writing." },
    ],
    faq: [
      {
        question: "Can O'range Textile copy a reference fabric?",
        answer: "A reference can guide the review, but the brief should identify which properties matter. Construction, composition, finish and performance still require confirmation.",
      },
      {
        question: "Which fields should be fixed before sampling?",
        answer: "Fix the garment use and non-negotiable specification fields. Mark colour, hand, finish or construction fields as supplier proposals only when alternatives are acceptable.",
      },
      {
        question: "Are MOQ and lead time fixed for custom development?",
        answer: "No. They depend on the article, colour, quantity, finishing, testing and current production conditions and belong in the current quotation.",
      },
    ],
    primaryCta: { label: "Start the sample and RFQ process", href: "/fabrics#inquiry-form" },
    secondaryCta: { label: "Review finished double knits", href: "/finished-double-knit-fabrics" },
    editorNotes: [
      "Replace the four-step process only after confirming the real sales and sampling workflow.",
      "Add response timing only when the sales owner accepts the public commitment.",
      "Keep MOQ, lead time and testing conditional unless the exact article is known.",
    ],
  },
};

export function getPublicLandingPage(key: LandingPageKey): PublicLandingPage {
  const { editorNotes: _editorNotes, ...publicContent } = landingPages[key];
  return publicContent;
}
