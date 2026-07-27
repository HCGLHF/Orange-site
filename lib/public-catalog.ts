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
      "Cotton jersey fabric is a single-knit construction with vertical V-shaped stitch legs on the smooth technical face and horizontal stitch crowns on the more textured technical back, commonly specified for T-shirts, base layers, loungewear and private-label basics.",
    sourcingOverview: [
      "Cotton jersey fabric is a single-knit construction often considered for soft, flexible apparel. The category name alone does not define the finished result: fibre composition, yarn count and yarn system, stitch density, GSM, usable width, dyeing and finishing can all change how the fabric looks, cuts, sews and behaves in a garment.",
      "Use this page to prepare a cotton jersey fabric brief for T-shirts, base layers, loungewear or private-label basics rather than to assume a stock specification. Share the garment, colour, finish, care route and testing requirements so the offered article can be reviewed against its intended application.",
    ],
    specificationChecks: [
      {
        label: "Composition and yarn direction",
        detail:
          "Within this sourcing field, provide the requested yarn specification rather than a fibre orientation: specify the fibre composition, yarn count or linear density, carded or combed preparation, the relevant spinning system, and twist or torque where spirality matters; confirm each field on the offered article.",
      },
      {
        label: "GSM and opacity",
        detail:
          "State the target GSM or acceptable range together with garment colour, season, layering and opacity expectations, then confirm weight and coverage on the finished sample because dyeing and finishing can change its appearance.",
      },
      {
        label: "Usable width",
        detail:
          "Provide the required usable width and garment-marker context, agree when width will be measured after dyeing, finishing and relaxation, and confirm it against the current finished sample and quotation.",
      },
      {
        label: "Stretch and recovery",
        detail:
          "Specify whether a non-elastane jersey brief is assessing construction-led stretch and residual growth or whether elastane-supported stretch and recovery are required, then define the direction and agreed test method and confirm the result on the finished sample.",
      },
      {
        label: "Dyeing and surface finish",
        detail:
          "State the colour reference, target hand and requested surface finish together with any garment-wash context, then confirm the approved shade and finish on the current sample using agreed review methods.",
      },
      {
        label: "Shrinkage, spirality, pilling and colourfastness",
        detail:
          "Specify the intended care route, test methods and tolerances for shrinkage, spirality, pilling and colourfastness, then confirm and approve the results for the exact finished article before a bulk decision.",
      },
    ],
    developmentGuidance: [
      "Choose one of three development paths: start from a catalogue article, send a reference sample, or submit a specification-led brief covering the garment, composition, GSM, usable width, opacity, finish, colour and testing requirements.",
      "For each path, O'range Textile can review the brief and coordinate the closest finished-fabric direction. The exact article, current sample route, availability and commercial terms must be confirmed in the current quotation rather than assumed from this category page.",
    ],
    buyerIntent: [
      "cotton jersey fabric manufacturer China",
      "cotton jersey fabric supplier Shaoxing",
      "combed cotton jersey for apparel brands",
    ],
    applications: ["T-shirts", "Base layers", "Loungewear", "Private-label basics"],
    relatedFabricIds: [],
    procurement: {
      evidence: {
        capability:
          "O'range Textile can review a cotton jersey buyer brief, reference sample or requested specification, coordinate the closest finished-sample discussion with the sourcing team, and prepare the current sample and quotation path for private confirmation.",
        qualitySteps: [
          "Match the labeled finished sample to the agreed cotton jersey specification.",
          "Run a sewing trial and review spirality after the agreed wash/dry method, alongside GSM, usable width and opacity, for the intended garment.",
          "Record dated approval, then confirm the current quotation for the requested program.",
        ],
        boundary:
          "The supplied 104-record finished-fabric catalogue does not verify a current exact cotton jersey article or its specification. Current availability, MOQ and lead time are inquiry-specific and must be confirmed with the offered sample and quotation.",
      },
      cta: {
        heading: "Review a cotton jersey brief with the sourcing team",
        body:
          "Start from a catalogue article, reference sample or specification-led brief, then confirm the current sample and quotation for the intended garment.",
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
        href: "/fabrics/cotton-spandex-jersey",
        label: "Compare cotton jersey with cotton spandex jersey",
        description:
          "Review when a closer-fitting garment brief needs elastane-supported stretch and recovery rather than a conventional cotton jersey direction.",
      },
      {
        href: "/fabrics/interlock-fabric",
        label: "Compare cotton jersey with interlock fabric",
        description:
          "Use the interlock route when the garment brief calls for a double-knit construction, balanced faces or greater edge stability.",
      },
      {
        href: "/custom-knit-fabric-development",
        label: "Send a cotton jersey development brief",
        description:
          "Share a catalogue article, reference sample or specification-led brief for a current sample and quotation review.",
      },
      {
        href: "/ready-stock-knit-fabrics",
        label: "Review documented finished-fabric records",
        description:
          "Start from documented article data, then ask sales to confirm the closest sourcing route.",
      },
    ],
    faq: [
      {
        question: "What is cotton jersey fabric used for?",
        answer:
          "Cotton jersey fabric is commonly considered for T-shirts, base layers, loungewear and private-label basics because the single-knit construction can provide a soft, flexible fabric direction. Buyers should still match the exact article, opacity, drape, seam behaviour and care route to the garment before approval.",
      },
      {
        question: "Can overseas buyers request cotton jersey samples?",
        answer:
          "Yes. An overseas buyer can start from a catalogue article, send a reference sample or submit a specification-led brief. O'range Textile can then review the garment use and requested checks, while current sample availability and the quotation are confirmed for the inquiry.",
      },
      {
        question:
          "How should buyers specify GSM and opacity for a cotton jersey T-shirt?",
        answer:
          "There is no universal GSM for every cotton jersey T-shirt. State the season, colour, silhouette, layering and opacity requirement, then confirm GSM and coverage on the current finished sample under an agreed viewing or test method before approval.",
      },
      {
        question:
          "What is the difference between 100% cotton and cotton-rich jersey?",
        answer:
          "100% cotton identifies an all-cotton fibre composition, while cotton-rich jersey includes another disclosed fibre that may change stretch, recovery, hand or care behaviour. Composition does not by itself establish performance, so buyers should confirm construction, finish and test requirements on the exact article.",
      },
      {
        question: "How should shrinkage and spirality be checked?",
        answer:
          "Buyers should state the conditioning, wash, drying and measurement method, plus acceptable shrinkage and spirality limits for the garment. Test the offered finished sample using the agreed method and approve the actual article rather than relying on a category-level result.",
      },
      {
        question: "Can buyers request custom colour, finish and usable width?",
        answer:
          "A buyer can include custom colour, surface finish and usable-width targets in the brief. O'range Textile can review them against a catalogue article or reference sample, but the achievable combination, sample route and commercial terms are confirmed for the specific inquiry and not assumed from the category page.",
      },
    ],
  },
  {
    slug: "cotton-spandex-jersey",
    name: "Cotton spandex jersey fabrics",
    shortName: "Cotton spandex jersey",
    description:
      "Cotton spandex jersey fabric is a single-knit construction combining cotton and spandex for fitted tees, childrenswear, loungewear and other movement-led apparel, subject to exact article and finished-sample review.",
    sourcingOverview: [
      "Cotton spandex jersey fabric combines a single-jersey construction with disclosed cotton and spandex content. Composition records the disclosed fibre content and ratio; it is not a performance result. Construction, yarn and elastane selection, stitch density, dyeing, heat history, finish and relaxation influence the measured fabric behaviour.",
      "Use this category to prepare a brief for fitted tees, childrenswear, loungewear or other movement-led apparel. State the garment use, opacity, stretch direction, recovery criteria, usable width, colour, finish and test methods so the current finished sample can be assessed against the intended garment.",
    ],
    specificationChecks: [
      {
        label: "Cotton and spandex composition",
        detail:
          "Specify the target cotton and spandex fibre composition and ratio, the yarn count or linear density and yarn specification or system where relevant, the intended jersey construction, and any relevant elastane incorporation or arrangement details. Composition disclosure does not establish a performance result, so confirm hand, coverage, stretch and dimensional behaviour on the offered finished sample.",
      },
      {
        label: "GSM and opacity",
        detail:
          "State the target GSM range and garment opacity or coverage requirement, including colour and layering context. Agree the conditioning and relaxation stage before measurement, then confirm both points on the current finished sample.",
      },
      {
        label: "Usable width after relaxation",
        detail:
          "Specify the usable width target and how usable width excludes edges or unstable areas. Agree the conditioning and relaxation procedure, then confirm the measured width against the current article and garment marker.",
      },
      {
        label: "Stretch direction and recovery",
        detail:
          "Define the required stretch direction and test method, then state recovery or growth criteria and tolerance after the agreed rest period. Approve the measured result on the finished sample for the intended garment.",
      },
      {
        label: "Dyeing, heat history and finish",
        detail:
          "Specify the dyeing route, colour and hand target, then review the elastane-relevant heat history and finishing sequence for the offered article. Confirm the final appearance, hand and dimensional response on the current sample.",
      },
      {
        label: "Shrinkage, torque, pilling and colourfastness",
        detail:
          "List the garment-relevant checks and state each test method, conditioning or wash-and-dry route, measurement points and acceptance tolerance. Confirm the results for the exact finished article rather than applying a category-level result.",
      },
    ],
    developmentGuidance: [
      "Start from one of three development paths: a catalogue article, a reference sample or a specification-led brief. For each path, share the garment use, target fibre composition, relevant yarn specification or system, GSM, opacity, usable width, stretch and recovery criteria, colour, finish and testing requirements.",
      "O'range Textile reviews the selected path and compares the buyer brief with the offered fabric evidence. Any current exact article, current sample and current quotation are confirmed for the specific inquiry before the buyer approves a sourcing direction.",
    ],
    buyerIntent: [
      "cotton spandex jersey fabric supplier",
      "cotton spandex jersey fabric manufacturer",
      "95 cotton 5 spandex jersey fabric",
    ],
    applications: ["Fitted T-shirts", "Childrenswear", "Sportswear", "Loungewear"],
    relatedFabricIds: [],
    procurement: {
      evidence: {
        capability:
          "O'range Textile can review a cotton spandex jersey buyer brief, compare a reference sample or specification-led request, coordinate the requested sample and article checks, and return documented points for buyer approval before quotation.",
        qualitySteps: [
          "Match the labelled finished sample and article reference to the agreed cotton spandex jersey specification.",
          "Review composition, GSM, usable width, stretch, recovery and garment-relevant checks under the agreed method, criteria and tolerance.",
          "Record the dated sample approval and remaining exceptions, then confirm the current quotation for the requested programme.",
        ],
        boundary:
          "The supplied 104-record finished-fabric catalogue does not verify a current exact cotton spandex jersey article or specification. Article availability, sample status, MOQ, lead time, colour, finish, testing route and commercial terms are inquiry-specific and must be confirmed in the current quotation.",
      },
      cta: {
        heading: "Review a cotton spandex jersey brief before quoting",
        body:
          "Share the garment use, target fibre composition, relevant yarn specification or system, stretch and recovery criteria, opacity, usable width, colour, finish and testing requirements for current sample and quotation review.",
        label: "Request a cotton spandex jersey sample or quotation",
        inquiryOptionId: "cotton-spandex-jersey",
      },
    },
    relatedLinks: [
      {
        href: "/fabrics/cotton-jersey",
        label: "Compare with cotton jersey fabric",
        description:
          "Review a cotton jersey route when the garment brief prioritises a conventional single-knit construction, then compare the exact finished samples for fit, opacity, hand and dimensional behaviour.",
      },
      {
        href: "/fabrics/rib-knit-fabric",
        label: "Compare with rib knit fabric",
        description:
          "Review rib geometry as a separate stretch-fabric direction, then compare the labelled samples using the garment's required extension, recovery, edge and surface criteria.",
      },
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
        label: "Choose a cotton spandex jersey development path",
        description:
          "Start from a catalogue article, reference sample or specification-led brief, then have the current sample and quotation reviewed against the garment requirements.",
      },
    ],
    faq: [
      {
        question: "Why use spandex in cotton jersey?",
        answer:
          "Spandex is specified when a cotton jersey garment brief calls for a stretch-and-recovery direction, such as a closer fit or repeated movement. Buyers should still define the direction, test method and recovery criteria, then approve the current finished sample because fibre content alone does not establish garment performance.",
      },
      {
        question: "Does O'range Textile supply cotton-rich stretch knits?",
        answer:
          "O'range Textile can review a cotton-rich stretch-knit buyer brief against a catalogue article, reference sample or specification-led request. The exact cotton spandex jersey article, sample status, specification and quotation are confirmed for the specific inquiry rather than assumed from this category page.",
      },
      {
        question: "How should stretch direction and recovery be specified?",
        answer:
          "State the required stretch direction, the extension test method and the recovery or growth criteria and tolerance after an agreed rest period. Include the garment fit and use, then compare the measured current sample with the brief before article approval.",
      },
      {
        question: "Does a 95/5 composition guarantee the same performance?",
        answer:
          "A 95/5 ratio alone does not establish stretch, recovery, opacity, hand or dimensional behaviour. Construction, yarn and elastane selection, stitch density, dye and heat history, finish, relaxation and the test method all affect the measured sample, so approve the exact article against the garment brief.",
      },
      {
        question: "When should GSM and usable width be measured?",
        answer:
          "Agree the conditioning and relaxation procedure before measurement, including the stage after finishing at which the fabric will be assessed. Record GSM and usable width on the labelled current sample or article, then compare them with the garment marker and agreed specification.",
      },
      {
        question: "Can buyers request custom colour, finish and testing?",
        answer:
          "Buyers can include colour, hand, surface finish and garment-relevant test requirements in a catalogue, reference-sample or specification-led brief. O'range Textile can review the requested combination, while the sampling route, test scope and commercial terms are confirmed for the specific inquiry in the current quotation.",
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
      "French terry fabric is identified by its loop-back reverse rather than by one fixed composition, weight or performance result. For comparison, brushed fleece commonly has a raised reverse, with one- or two-sided brushing depending on the article; buyers should confirm the actual construction and finish on the offered sample instead of treating the names as interchangeable.",
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
          "The supplied 104-record finished-fabric catalogue does not verify a current exact French terry article or production specification. Availability, composition, GSM, usable width, finish, test result, MOQ and lead time remain inquiry-specific.",
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
          "French terry normally retains visible loops on the reverse; by comparison, brushed fleece commonly has a raised reverse, with one- or two-sided brushing depending on the article. Weight, hand, warmth and durability still depend on the exact article, so buyers should compare labeled finished samples.",
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
