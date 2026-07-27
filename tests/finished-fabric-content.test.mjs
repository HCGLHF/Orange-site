import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "content", "finished-fabrics.json");

const requiredRoutes = [
  "/finished-double-knit-fabrics",
  "/fabrics/interlock-fabric",
  "/fabrics/ponte-roma-fabric",
  "/fabrics/scuba-air-layer-fabric",
  "/fabrics/jacquard-knit-fabric",
  "/fabrics/wool-blend-knit-fabric",
  "/fabrics/rib-knit-fabric",
  "/blog",
  "/blog/what-is-double-knit-fabric",
  "/blog/what-is-interlock-fabric",
  "/blog/what-is-ponte-fabric",
  "/blog/what-is-scuba-knit-fabric",
  "/blog/what-is-rib-knit-fabric",
  "/blog/jacquard-knit-vs-woven-jacquard",
  "/blog/air-layer-knit-fabric-sourcing-guide",
  "/blog/how-to-source-wool-blend-knit-fabric",
  "/blog/jacquard-knit-fabric-weight-and-width-guide",
  "/blog/brushed-and-pile-knit-fabric-finishes",
  "/blog/how-to-write-a-knit-fabric-rfq",
  "/blog/knit-fabric-sourcing-questions",
  "/blog/french-terry-fabric-vs-fleece",
  "/blog/french-terry-fabric-for-hoodies",
  "/blog/heavyweight-french-terry-fabric",
  "/blog/interlock-vs-jersey-fabric",
];

const procurementGuideRoutes = [
  "/blog/french-terry-fabric-vs-fleece",
  "/blog/french-terry-fabric-for-hoodies",
  "/blog/heavyweight-french-terry-fabric",
  "/blog/interlock-vs-jersey-fabric",
];

function loadPages() {
  assert.ok(existsSync(contentPath), "finished-fabrics.json must exist");
  return JSON.parse(readFileSync(contentPath, "utf8"));
}

function flattenText(value) {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenText);
  }
  return [];
}

function wordCount(page) {
  const text = JSON.stringify(page)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^A-Za-z0-9'-]+/g, " ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasBoundedCatalogueRange(context) {
  return (
    /approximate 210-510 GSM and 133-185 cm/i.test(context) &&
    /entire supplied 104-record finished-fabric catalogue/i.test(context) &&
    /not an interlock-specific range/i.test(context) &&
    /not a promise of available values/i.test(context)
  );
}

function hasBoundedParentMachineContext(context) {
  return (
    /parent company's supplied record/i.test(context) &&
    /200\+ circular knitting machines/i.test(context) &&
    /not an order specification/i.test(context) &&
    /not interlock-specific capacity/i.test(context)
  );
}

function detectUnsupportedFixedInterlockClaims(text) {
  const numericSpecification =
    /\b\d+(?:\.\d+)?\s*(?:GSM|cm|mm|%|percent)(?=\s|[.,;:!?)]|$)/i;
  const machineCount = /\b\d+\+?\s+(?:circular knitting )?machines?\b/i;
  const approvedCatalogueOccurrence =
    /approximate 210-510 GSM and 133-185 cm usable[- ]width span (?:across|belongs to) the entire supplied 104-record finished-fabric catalogue/gi;
  const approvedParentMachineOccurrence =
    /200\+ circular knitting machines(?: across double-knit and rib configurations)?/gi;
  const fixedCommercialPatterns = [
    /\b(?:MOQ|minimum order)\b[^.!?]*\b\d+(?:[.,]\d+)?\b/i,
    /\b(?:available|availability)\b[^.!?]*\b\d+(?:[.,]\d+)?\b/i,
    /\b(?:lead time|delivery)\b[^.!?]*\b\d+\s*(?:days?|weeks?)\b/i,
    /\b\d+\s*(?:day|week)s?\b[^.!?]*\blead time\b/i,
  ];
  const unsupportedOutcomePatterns = [
    /\b(?:certified|certification)\b/i,
    /\b(?:passed testing|passes all tests|guaranteed performance)\b/i,
  ];
  const sentences = text
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const violations = [];

  for (const [index, sentence] of sentences.entries()) {
    const context = sentences
      .slice(Math.max(0, index - 1), Math.min(sentences.length, index + 2))
      .join(" ");
    let unapprovedText = sentence;

    if (hasBoundedCatalogueRange(context)) {
      unapprovedText = unapprovedText.replace(approvedCatalogueOccurrence, "");
    }
    if (hasBoundedParentMachineContext(context)) {
      unapprovedText = unapprovedText.replace(
        approvedParentMachineOccurrence,
        ""
      );
    }

    const hasUnsupportedSpecification =
      numericSpecification.test(unapprovedText);
    const hasUnsupportedMachineCount =
      machineCount.test(unapprovedText);
    const hasUnsupportedCommercialTerm = fixedCommercialPatterns.some(
      (pattern) => pattern.test(unapprovedText)
    );
    const hasUnsupportedOutcome = unsupportedOutcomePatterns.some((pattern) =>
      pattern.test(unapprovedText)
    );

    if (
      hasUnsupportedSpecification ||
      hasUnsupportedMachineCount ||
      hasUnsupportedCommercialTerm ||
      hasUnsupportedOutcome
    ) {
      violations.push(sentence);
    }
  }

  return violations;
}

function assertNoUnsupportedFixedInterlockClaims(text) {
  const violations = detectUnsupportedFixedInterlockClaims(text);
  assert.deepEqual(
    violations,
    [],
    `unsupported fixed Interlock claims:\n${violations.join("\n")}`
  );
}

test("content registry contains every approved finished-fabric route", () => {
  const pages = loadPages();
  assert.equal(pages.length, requiredRoutes.length);
  assert.deepEqual(
    pages.map((page) => page.url).sort(),
    [...requiredRoutes].sort()
  );
});

test("every page has answer-first copy, FAQs and internal routes", () => {
  const pages = loadPages();

  for (const page of pages) {
    assert.ok(page.opening.length >= 120, `${page.url} needs an opening answer`);
    assert.ok(page.sections.length >= 3, `${page.url} needs at least three sections`);
    assert.ok(page.faq.length >= 3, `${page.url} needs at least three FAQs`);
    assert.ok(page.relatedLinks.length >= 5, `${page.url} needs five internal routes`);
    assert.ok(
      page.relatedLinks.every((link) => link.href !== page.url),
      `${page.url} must not link to itself`
    );
    assert.ok(wordCount(page) >= 650, `${page.url} needs publishable content depth`);
  }
});

test("procurement guides provide complete buyer decisions and internal routes", () => {
  const pages = loadPages();
  const guides = pages.filter((page) =>
    procurementGuideRoutes.includes(page.url)
  );

  assert.equal(guides.length, procurementGuideRoutes.length);
  for (const page of guides) {
    assert.equal(page.kind, "article", `${page.url} must be an article`);
    assert.ok(page.opening.length >= 140, `${page.url} opening answer`);
    assert.ok(page.sections.length >= 4, `${page.url} needs four sections`);
    assert.ok(page.faq.length >= 4, `${page.url} needs four FAQs`);
    assert.ok(
      page.relatedLinks.length >= 7,
      `${page.url} needs seven internal routes`
    );
    assert.ok(page.evidenceSnapshot, `${page.url} needs evidence decisions`);
    assert.ok(
      page.evidenceSnapshot.summary.length >= 180,
      `${page.url} evidence summary`
    );
    assert.ok(
      page.evidenceSnapshot.items.length >= 3,
      `${page.url} evidence items`
    );
    assert.ok(wordCount(page) >= 750, `${page.url} needs buyer-guide depth`);
  }
});

test("procurement guides receive contextual inbound links", () => {
  const pages = loadPages();

  for (const target of procurementGuideRoutes) {
    const inbound = pages.filter((page) =>
      page.relatedLinks.some((link) => link.href === target)
    );
    assert.ok(
      inbound.length >= 3,
      `${target} needs at least three contextual inbound routes`
    );
    assert.ok(
      inbound.some((page) => !procurementGuideRoutes.includes(page.url)),
      `${target} needs an inbound route from established content`
    );
  }
});

test("breadcrumbs render the current page without a clickable self-link", () => {
  const component = readFileSync(
    path.join(root, "components/finished-fabric/FinishedFabricPage.tsx"),
    "utf8"
  );

  assert.match(component, /aria-current="page"/);
  assert.match(component, /index === page\.breadcrumbs\.length - 1/);
});

test("content stays inside the verified finished-fabric evidence boundary", () => {
  const pages = loadPages();
  const source = JSON.stringify(pages);
  const forbidden = [
    /guaranteed lead time/i,
    /fixed moq/i,
    /certified organic/i,
    /(?:contains|made (?:with|from)|includes) cashmere fibre/i,
    /(?:all|every) air-layer fabrics? (?:are|is) (?:a )?spacer/i,
    /greige fabric supplier/i,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});

test("machine-source copy keeps private configuration details unpublished", () => {
  const machineContext = flattenText(loadPages())
    .flatMap((text) => text.split(/(?<=[.!?])\s+/))
    .filter((sentence) =>
      /\b(?:machine (?:sheet|record|inventory)|inventory|machines?)\b/i.test(sentence)
    )
    .join("\n");

  assert.doesNotMatch(
    machineContext,
    /34-inch|38-inch|gauges from 12 to 36|gauges from 18 to 32|across gauges 18, 20/i
  );
  assert.match(machineContext, /\b(?:72|84)-(?:feed|feeder)\b/i);
  assert.match(machineContext, /\b17 (?:documented )?(?:machine )?configurations\b/i);
});

test("machine evidence is attributed to the parent company at reviewed locations", () => {
  const pages = loadPages();
  const ponte = pages.find((page) => page.url === "/fabrics/ponte-roma-fabric");
  const rib = pages.find((page) => page.url === "/fabrics/rib-knit-fabric");
  const doubleKnitGuide = pages.find(
    (page) => page.url === "/blog/what-is-double-knit-fabric"
  );
  const doubleKnitEvidence = doubleKnitGuide.sections.find(
    (section) => section.heading === "Connect the learning page to a finished-fabric RFQ"
  ).paragraphs[0];
  const source = flattenText(pages).join("\n");

  assert.match(
    ponte.opening,
    /The parent company's machine record lists Roma fabric among its documented entries\./
  );
  assert.match(
    rib.opening,
    /The parent company's machine record documents 40\+ rib\/72-feed machines across multiple configurations\./
  );
  assert.match(
    doubleKnitEvidence,
    /O'range Textile's supplied catalogue describes 104 finished-fabric records across 11 series\. The parent company's supplied machine record describes 200\+ circular knitting machines across double-knit and rib configurations\./
  );
  assert.doesNotMatch(
    source,
    /O'range Textile's (?:supplied )?machine|O'range Textile's supplied evidence/i
  );
  assert.doesNotMatch(
    source,
    /(?:The submitted machine sheet|The supplied machine sheet|The machine inventory)\b/i
  );
});

test("finished-fabric hub uses supplied catalogue series and representative articles", () => {
  const pages = loadPages();
  const hub = pages.find((page) => page.url === "/finished-double-knit-fabrics");
  const source = JSON.stringify(hub);

  assert.match(source, /11 (?:documented )?finished-fabric series/i);
  for (const article of ["GD2515", "GD2672", "6128", "GD2502", "2552", "GD2712", "GD2590", "GD2579"]) {
    assert.match(source, new RegExp(article));
  }
  assert.match(source, /160 cm/i);
  assert.match(source, /300 GSM/i);
});

test("finished-fabric hub links every commercial fabric route", () => {
  const pages = loadPages();
  const hub = pages.find((page) => page.url === "/finished-double-knit-fabrics");
  const productRoutes = pages
    .filter((page) => page.kind === "product")
    .map((page) => page.url);
  const hubRoutes = new Set(hub.relatedLinks.map((link) => link.href));

  for (const route of productRoutes) {
    assert.ok(hubRoutes.has(route), `hub must link ${route}`);
  }
});

test("catalogue guides use approved article and specification evidence", () => {
  const pages = loadPages();
  const routes = [
    "/blog/air-layer-knit-fabric-sourcing-guide",
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
    "/blog/how-to-write-a-knit-fabric-rfq",
    "/blog/knit-fabric-sourcing-questions",
  ];
  const source = JSON.stringify(
    pages.filter((page) => routes.includes(page.url))
  );

  for (const signal of [
    "GD2515",
    "GD2672",
    "GD2579",
    "GD2683",
    "260 GSM",
    "300 GSM",
    "160 cm",
    "160-165 cm",
    "usable width",
    "sample approval",
    "commercial confirmation",
  ]) {
    assert.match(source, new RegExp(signal, "i"));
  }
});

test("new catalogue guides have at least three contextual inbound routes", () => {
  const pages = loadPages();
  const targets = [
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
  ];

  for (const target of targets) {
    const registryEntries = pages.filter((page) =>
      page.relatedLinks.some((link) => link.href === target)
    );
    assert.ok(
      registryEntries.length >= 2,
      `${target} needs two contextual entries in addition to the blog index`
    );
  }
});

test("catalogue-derived guides publish unique evidence snapshots", () => {
  const pages = loadPages();
  const guideRoutes = [
    "/blog/air-layer-knit-fabric-sourcing-guide",
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
    "/blog/how-to-write-a-knit-fabric-rfq",
    "/blog/knit-fabric-sourcing-questions",
  ];
  const guides = pages.filter((page) => guideRoutes.includes(page.url));

  assert.equal(guides.length, guideRoutes.length);
  assert.equal(
    new Set(guides.map((page) => page.evidenceSnapshot?.heading)).size,
    guideRoutes.length
  );

  for (const page of guides) {
    assert.ok(page.evidenceSnapshot, `${page.url} needs an evidence snapshot`);
    assert.ok(
      page.evidenceSnapshot.summary.length >= 180,
      `${page.url} needs a substantive evidence summary`
    );
    assert.ok(
      page.evidenceSnapshot.items.length >= 3,
      `${page.url} needs at least three evidence decisions`
    );
  }
});

test("Next.js exposes the hub, blog, product routes and machine-readable discovery", () => {
  const requiredFiles = [
    "app/finished-double-knit-fabrics/page.tsx",
    "app/blog/page.tsx",
    "app/blog/[slug]/page.tsx",
    "components/finished-fabric/FinishedFabricPage.tsx",
    "lib/finished-fabric-content.ts",
  ];

  for (const relativePath of requiredFiles) {
    assert.ok(existsSync(path.join(root, relativePath)), `${relativePath} must exist`);
  }

  const sitemap = readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
  const llms = readFileSync(path.join(root, "app/llms.txt/route.ts"), "utf8");
  assert.match(sitemap, /getAllPublicPageSeo/);
  assert.match(llms, /getAllPublicPageSeo/);
});

test("the native pages use the real inquiry modal and bundled visual assets", () => {
  const component = readFileSync(
    path.join(root, "components/finished-fabric/FinishedFabricPage.tsx"),
    "utf8"
  );
  assert.match(component, /SampleRequestCta/);
  assert.match(component, /next\/image/);

  const images = [
    "finished-double-knit-factory.webp",
    "double-knit-interlock-comparison.webp",
    "ponte-scuba-apparel-development.webp",
    "jacquard-wool-blend-swatches.webp",
    "finished-fabric-sample-inspection.webp",
    "air-layer-material-study.webp",
    "wool-blend-material-study.webp",
    "jacquard-knit-material-study.webp",
    "brushed-pile-knit-finishes.webp",
    "knit-fabric-rfq-specification.webp",
  ];
  for (const image of images) {
    assert.ok(
      existsSync(path.join(root, "public/images/finished-fabrics", image)),
      `${image} must be bundled`
    );
  }
});

test("the inquiry modal offers finished-fabric development directions", () => {
  const modal = readFileSync(
    path.join(root, "components/ui/InquiryModal.tsx"),
    "utf8"
  );
  const data = readFileSync(path.join(root, "lib/data.ts"), "utf8");
  assert.match(modal, /finishedFabricInquiryOptions/);
  assert.doesNotMatch(modal, /fabrics\.map/);
  assert.match(data, /Air-layer finished knit fabric/);
  assert.match(data, /Cashmere-blend finished knit fabric/);
  assert.match(data, /Greige fabric requirement/);
  assert.match(data, /Finished garment requirement/);
});

test("interlock product page keeps its route, FAQ, links and inquiry contract", () => {
  const interlock = loadPages().find(
    (page) => page.url === "/fabrics/interlock-fabric"
  );

  assert.ok(interlock, "interlock product page must exist");
  assert.equal(interlock.kind, "product");
  assert.equal(interlock.faq.length, 6);

  const questions = new Set(interlock.faq.map((item) => item.q));
  assert.ok(
    questions.has("How does interlock differ from cotton jersey and Ponte Roma?")
  );
  assert.ok(
    questions.has(
      "Which GSM, usable width and recovery fields should an interlock RFQ include?"
    )
  );
  assert.doesNotMatch(flattenText(interlock).join("\n"), /\ba interlock\b/i);

  const relatedRoutes = new Set(
    interlock.relatedLinks.map((link) => link.href)
  );
  assert.ok(relatedRoutes.has("/fabrics/cotton-jersey"));
  assert.ok(relatedRoutes.has("/fabrics/cotton-spandex-jersey"));
  assert.deepEqual(
    interlock.relatedLinks.find((link) => link.href === "/#contact"),
    {
      href: "/#contact",
      label: "Request samples or send an RFQ",
    }
  );
});

test("interlock catalogue ranges stay bounded as catalogue-wide evidence", () => {
  const interlock = loadPages().find(
    (page) => page.url === "/fabrics/interlock-fabric"
  );
  const rangeSection = interlock.sections.find(
    (section) => section.heading === "Documented range and manufacturing fit"
  );
  const rangeParagraph = rangeSection.paragraphs.find(
    (paragraph) =>
      paragraph.includes("210-510 GSM") && paragraph.includes("133-185 cm")
  );
  const rangeRow = rangeSection.table.rows.find((row) =>
    row.some(
      (cell) => cell.includes("210-510 GSM") && cell.includes("133-185 cm")
    )
  );

  assert.ok(rangeParagraph, "interlock range paragraph must remain present");
  assert.match(rangeParagraph, /O'range Textile's supplied workbook/i);
  assert.match(
    rangeParagraph,
    /entire supplied 104-record finished-fabric catalogue/i
  );
  assert.match(rangeParagraph, /not an interlock-specific range/i);
  assert.match(rangeParagraph, /not a promise of available values/i);
  assert.match(
    rangeParagraph,
    /current article sheet, labeled sample, and quotation/i
  );

  assert.ok(rangeRow, "interlock table must retain a catalogue-scope row");
  assert.equal(rangeRow[0], "Catalogue-wide reference only");
  assert.match(rangeRow.join(" "), /not an interlock-specific range/i);
  assert.match(
    rangeRow.join(" "),
    /current article sheet, approved sample, and quotation/i
  );

  const boundedRangeUses = flattenText(interlock).filter(
    (text) => text.includes("210-510 GSM") || text.includes("133-185 cm")
  );
  assert.ok(boundedRangeUses.length >= 2);
  for (const use of boundedRangeUses) {
    assert.match(use, /catalogue|workbook/i);
    assert.match(use, /not an interlock-specific range/i);
  }

  const machineContext = rangeSection.paragraphs.find((paragraph) =>
    paragraph.includes("200+ circular knitting machines")
  );
  assert.match(machineContext, /parent company's supplied record/i);
  assert.match(machineContext, /not an order specification/i);
  assert.match(machineContext, /not interlock-specific capacity/i);
});

test("finished-fabric catalogue provenance stays supplied and neutral", () => {
  const pages = loadPages();
  const buyerVisibleText = flattenText(pages).join("\n");
  const catalogueSourceBoundaries = pages
    .map((page) => page.evidenceBoundary)
    .filter((boundary) => boundary?.includes("104-record"));

  assert.ok(
    catalogueSourceBoundaries.length > 0,
    "at least one 104-record catalogue boundary must remain present"
  );
  for (const boundary of catalogueSourceBoundaries) {
    assert.match(
      boundary,
      /the supplied 104-record finished-fabric catalogue/i
    );
  }

  const recordCountFaq = pages
    .flatMap((page) => page.faq ?? [])
    .find((faq) => faq.q === "How many finished-fabric records are documented?");
  assert.ok(recordCountFaq, "record-count FAQ must remain present");
  assert.match(
    recordCountFaq.a,
    /the supplied 104-record finished-fabric catalogue/i
  );

  assert.doesNotMatch(
    buyerVisibleText,
    /historical\/draft|(?:current\s+)?owner-confirmed|\bcurrent\s+(?:(?!(?:quotation|availability|confirmation)\b)[\w-]+\s+){0,4}(?:catalogue|records?|workbook)\b/i
  );
});

test("interlock procurement table covers the buyer approval decisions", () => {
  const interlock = loadPages().find(
    (page) => page.url === "/fabrics/interlock-fabric"
  );
  const rangeSection = interlock.sections.find(
    (section) => section.heading === "Documented range and manufacturing fit"
  );
  const rows = new Map(
    rangeSection.table.rows.map((row) => [row[0], row.join(" ")])
  );

  const expectedLabels = [
    "Article identity and sample version",
    "Construction and composition",
    "GSM",
    "Usable width",
    "Stretch and recovery",
    "Face, reverse and finish",
    "Colour approval",
    "Testing and acceptance",
  ];
  for (const label of expectedLabels) {
    assert.ok(rows.has(label), `interlock table needs the "${label}" row`);
  }

  assert.match(rows.get("Article identity and sample version"), /article code/i);
  assert.match(
    rows.get("Article identity and sample version"),
    /approved sample version/i
  );
  assert.match(
    rows.get("Construction and composition"),
    /exact construction and fibre composition/i
  );
  assert.match(rows.get("GSM"), /article-specific GSM/i);
  assert.match(rows.get("Usable width"), /article-specific usable width/i);
  assert.match(
    rows.get("Stretch and recovery"),
    /stretch direction, extension, and recovery or growth/i
  );
  assert.match(
    rows.get("Face, reverse and finish"),
    /face, reverse, and finish/i
  );
  assert.match(rows.get("Colour approval"), /colour reference and approval/i);
  assert.match(
    rows.get("Testing and acceptance"),
    /test methods, reports, and acceptance rules/i
  );
});

test("unsupported Interlock claim detector rejects fixed-value mutations", async (t) => {
  const negativeControls = [
    {
      name: "fixed article weight",
      text: "Interlock fabric weighs 250 GSM.",
    },
    {
      name: "fixed article composition",
      text: "Interlock fabric is 95% cotton.",
    },
    {
      name: "fixed MOQ",
      text: "MOQ starts at 500 kg.",
    },
    {
      name: "fixed colour availability",
      text: "Available in 20 colours.",
    },
    {
      name: "fixed article value beside bounded catalogue evidence",
      text: "The approximate 210-510 GSM and 133-185 cm usable-width span belongs to the entire supplied 104-record finished-fabric catalogue, not an interlock-specific range and not a promise of available values. Interlock fabric weighs 250 GSM.",
    },
    {
      name: "fixed capacity beside bounded parent evidence",
      text: "The parent company's supplied record documents 200+ circular knitting machines; this is not an order specification and not interlock-specific capacity. Interlock fabric has 300 machines.",
    },
    {
      name: "fixed article value inside bounded catalogue sentence",
      text: "The approximate 210-510 GSM and 133-185 cm usable-width span belongs to the entire supplied 104-record finished-fabric catalogue and Interlock fabric weighs 250 GSM; this is not an interlock-specific range and not a promise of available values.",
    },
    {
      name: "fixed capacity inside bounded parent sentence",
      text: "The parent company's supplied record documents 200+ circular knitting machines and Interlock fabric has 300 machines; this is not an order specification and not interlock-specific capacity.",
    },
  ];

  for (const control of negativeControls) {
    await t.test(control.name, () => {
      assert.throws(
        () => assertNoUnsupportedFixedInterlockClaims(control.text),
        /unsupported fixed Interlock claims/i
      );
    });
  }
});

test("unsupported Interlock claim detector allows bounded supplied evidence", () => {
  const legitimateEvidence = [
    "O'range Textile's supplied workbook records an approximate 210-510 GSM and 133-185 cm usable-width span across the entire supplied 104-record finished-fabric catalogue. This is not an interlock-specific range, not a promise of available values, and not an article specification.",
    "The parent company's supplied record documents 200+ circular knitting machines across double-knit and rib configurations. This manufacturing context is not an order specification and not interlock-specific capacity.",
  ];

  for (const evidence of legitimateEvidence) {
    assert.doesNotThrow(() =>
      assertNoUnsupportedFixedInterlockClaims(evidence)
    );
  }
});

test("interlock copy does not publish fixed article, commercial or test claims", () => {
  const interlock = loadPages().find(
    (page) => page.url === "/fabrics/interlock-fabric"
  );
  const source = flattenText(interlock).join("\n");

  assertNoUnsupportedFixedInterlockClaims(source);
  assert.match(
    source,
    /MOQ, lead time, color availability, testing, packing, and payment terms are order-specific/i
  );
});
