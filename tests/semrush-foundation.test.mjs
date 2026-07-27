import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

const loadPublicCatalog = () =>
  import(new URL("../lib/public-catalog.ts", import.meta.url).href);

const loadInquiryOptions = () =>
  import(new URL("../lib/data.ts", import.meta.url).href);

const assertMatchesAll = (actual, expectedPatterns, context) => {
  for (const expectedPattern of expectedPatterns) {
    assert.match(
      actual,
      expectedPattern,
      `${context} must match ${expectedPattern}`
    );
  }
};

const collectCategoryClaims = (category) =>
  [
    category.description,
    ...category.sourcingOverview,
    ...category.specificationChecks.map((check) => check.detail),
    ...category.developmentGuidance,
    category.procurement.evidence.capability,
    ...category.procurement.evidence.qualitySteps,
    category.procurement.evidence.boundary,
    category.procurement.cta.heading,
    category.procurement.cta.body,
    ...category.relatedLinks.map((link) => link.description),
    ...category.faq.map((faq) => faq.answer),
  ].join(" ");

const findUnsupportedFixedClaim = (
  claimsText,
  { allowExactCottonComposition = false } = {}
) => {
  const textToInspect = allowExactCottonComposition
    ? claimsText.replace(
        /\b100(?:\.0+)?\s*%\s+cotton\b/gi,
        "all-cotton fibre composition"
      )
    : claimsText;

  for (const unsupportedClaimPattern of [
    /\b\d+(?:\.\d+)?\s*(?:gsm|g\/m(?:2|²)|cm|mm|in(?:ch(?:es)?)?|kg|lb(?:s)?|cycles?|grade)\b/i,
    /\b\d+(?:\.\d+)?\s*%/i,
    /\b(?:certified|certification|certificate|guarantee(?:s|d|ing)?|ensur(?:e(?:s|d)?|ing)|always|never)\b/i,
    /\bcapacity\b/i,
    /\bfixed\s+(?:MOQ|lead time|capacity)\b/i,
    /(?:\bMOQ\b|\blead time\b)[^.!?]{0,25}\b\d+(?:\.\d+)?\b/i,
    /\b\d+(?:\.\d+)?\b[^.!?]{0,25}(?:\bMOQ\b|\blead time\b)/i,
  ]) {
    const match = textToInspect.match(unsupportedClaimPattern);
    if (match) return match[0];
  }

  return null;
};

const assertNoUnsupportedFixedClaims = (
  category,
  { allowExactCottonComposition = false } = {}
) => {
  const claimsText = collectCategoryClaims(category);
  assert.equal(
    findUnsupportedFixedClaim(claimsText, { allowExactCottonComposition }),
    null,
    "category copy contains an unsupported fixed value or guarantee"
  );

  const commercialTermSentences =
    claimsText
      .match(/[^.!?]*(?:\bMOQ\b|\blead time\b|\bcapacity\b)[^.!?]*[.!?]?/gi) ??
    [];
  for (const sentence of commercialTermSentences) {
    assert.match(
      sentence,
      /\b(?:confirm|inquiry-specific|not verif|rather than promised|not category-specific)\w*/i,
      `commercial terms must remain inquiry-specific: ${sentence}`
    );
  }
};

test("unsupported claim detection scopes composition percentages and guarantee inflections", () => {
  assert.equal(
    findUnsupportedFixedClaim("Specify 100% cotton as the fibre composition.", {
      allowExactCottonComposition: true,
    }),
    null
  );

  for (const unsafeClaim of [
    "The fabric delivers 95% recovery.",
    "The article has 30% shrinkage.",
    "The finish provides guaranteed recovery.",
    "The finish is guaranteeing recovery.",
    "The finish is ensuring recovery.",
  ]) {
    assert.ok(
      findUnsupportedFixedClaim(unsafeClaim, {
        allowExactCottonComposition: true,
      }),
      `expected unsupported-claim detection for: ${unsafeClaim}`
    );
  }
});

test("commercial fabric pages emit evidence-aligned WebPage schema", async () => {
  const schema = await readSource("lib/finished-fabric-schema.ts");

  assert.match(schema, /page\.kind === "product"[\s\S]+?"@type": "WebPage"/);
  assert.match(schema, /"@type": "Thing"/);
  assert.doesNotMatch(schema, /"@type": "Product"/);
  assert.doesNotMatch(schema, /aggregateRating|offers|review/);
});

test("homepage category ItemList gives every item a canonical URL", async () => {
  const geoContent = await readSource("lib/geo-content.ts");

  assert.match(
    geoContent,
    /fabricCategoryItemListJsonLd[\s\S]+?url: `\$\{siteUrl\}\/fabrics\/\$\{category\.slug\}`/
  );
});

test("blog index exposes every buyer guide through server-rendered links", async () => {
  const component = await readSource(
    "components/finished-fabric/FinishedFabricPage.tsx"
  );

  assert.match(component, /getFinishedBlogArticles/);
  assert.match(component, /page\.kind === "index"/);
  assert.match(component, /blogArticles\.map/);
  assert.match(component, /href=\{article\.url\}/);
  assert.match(component, /articleSeo\.metaDescription/);
});

test("catalogue guides render lightweight semantic evidence snapshots", async () => {
  const component = await readSource(
    "components/finished-fabric/FinishedFabricPage.tsx"
  );

  assert.match(component, /page\.evidenceSnapshot/);
  assert.match(component, /evidenceSnapshot\.items\.map/);
  assert.match(component, /<dl/);
  assert.match(component, /<dt/);
  assert.match(component, /<dd/);
});

test("fabric catalogue exposes every public category through crawlable links", async () => {
  const fabricsPage = await readSource("app/fabrics/page.tsx");

  assert.match(fabricsPage, /getPublicFabricCategories/);
  assert.match(fabricsPage, /publicCategories\.map/);
  assert.match(
    fabricsPage,
    /href=\{`\/fabrics\/\$\{category\.slug\}`\}/
  );
  assert.match(fabricsPage, /category\.description/);
});

test("legacy fabric categories carry route-specific sourcing depth", async () => {
  const catalogue = await readSource("lib/public-catalog.ts");

  assert.equal(
    (catalogue.match(/^    sourcingOverview:/gm) ?? []).length,
    4,
    "every legacy category needs a sourcing overview"
  );
  assert.equal(
    (catalogue.match(/^    specificationChecks:/gm) ?? []).length,
    4,
    "every legacy category needs specification checks"
  );
  assert.equal(
    (catalogue.match(/^    developmentGuidance:/gm) ?? []).length,
    4,
    "every legacy category needs development guidance"
  );

  for (const guide of [
    "/blog/what-is-interlock-fabric",
    "/blog/what-is-rib-knit-fabric",
    "/blog/what-is-scuba-knit-fabric",
    "/blog/jacquard-knit-vs-woven-jacquard",
  ]) {
    assert.match(catalogue, new RegExp(guide.replaceAll("/", "\\/")));
  }
});

test("legacy category pages render sourcing evidence and contextual routes", async () => {
  const categoryPage = await readSource("app/fabrics/[slug]/page.tsx");

  assert.match(categoryPage, /category\.sourcingOverview/);
  assert.match(categoryPage, /category\.specificationChecks\.map/);
  assert.match(categoryPage, /category\.developmentGuidance/);
  assert.match(categoryPage, /category\.relatedLinks\.map/);
});

test("legacy target categories publish runtime procurement evidence and inquiry mappings", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const expectedCtas = {
    "fleece-french-terry": {
      label: "Request a French terry sample or quotation",
      inquiryOptionId: "french-terry",
    },
    "cotton-jersey": {
      label: "Request a cotton jersey sample or quotation",
      inquiryOptionId: "cotton-jersey",
    },
    "cotton-spandex-jersey": {
      label: "Request a cotton spandex jersey sample or quotation",
      inquiryOptionId: "cotton-spandex-jersey",
    },
  };

  for (const [slug, expectedCta] of Object.entries(expectedCtas)) {
    const category = publicFabricCategories.find((item) => item.slug === slug);
    assert.ok(category, `expected ${slug} in the public category catalogue`);
    assert.ok(category.procurement, `${slug} needs procurement support`);
    assert.equal(category.procurement.cta.label, expectedCta.label);
    assert.equal(category.procurement.cta.inquiryOptionId, expectedCta.inquiryOptionId);
    assert.ok(category.procurement.cta.heading.trim());
    assert.ok(category.procurement.cta.body.trim());
    assert.ok(category.procurement.evidence.capability.length >= 120);
    assert.ok(category.procurement.evidence.boundary.length >= 120);
    assert.ok(category.procurement.evidence.qualitySteps.length >= 3);
    assert.ok(
      category.procurement.evidence.qualitySteps.every(
        (step) => typeof step === "string" && step.trim().length > 0
      ),
      `${slug} quality steps must be strings`
    );
    assert.doesNotMatch(category.procurement.evidence.capability, /Jingtian/i);
  }
});

test("French terry category publishes a focused procurement brief", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "fleece-french-terry"
  );

  assert.ok(category, "expected the French terry category in the public catalogue");
  assert.equal(category.name, "French terry fabrics");
  assert.equal(category.shortName, "French terry");
  assert.match(category.description, /^French terry fabric\b/);
  for (const buyerIntent of category.buyerIntent) {
    assert.match(
      buyerIntent,
      /^French terry\b/i,
      `buyer intent must keep French terry primary: ${buyerIntent}`
    );
  }

  assert.ok(category.procurement);
  const ctaFocus = [
    category.procurement.cta.heading,
    category.procurement.cta.body,
    category.procurement.cta.label,
  ].join(" ");
  assert.match(category.procurement.cta.heading, /French terry/i);
  assert.match(ctaFocus, /French terry/i);
  assert.doesNotMatch(
    [
      category.name,
      category.shortName,
      category.description,
      ...category.buyerIntent,
      ctaFocus,
    ].join(" "),
    /\bfleece\b/i
  );
  assert.match(category.description, /loop-back/i);
  assert.match(category.description, /hoodies/i);

  const fleeceSourcingSentences = category.sourcingOverview.flatMap(
    (paragraph) =>
      paragraph.match(/[^.!?]*\bfleece\b[^.!?]*[.!?]?/gi) ?? []
  );
  assert.ok(
    fleeceSourcingSentences.length > 0,
    "the sourcing overview should retain the useful brushed-fleece comparison"
  );
  for (const sentence of fleeceSourcingSentences) {
    assert.match(
      sentence,
      /\b(?:compar(?:e|ison)|different|rather than|not interchangeable|separate)\b/i,
      `fleece must appear only as comparison context: ${sentence}`
    );
  }

  assert.deepEqual(
    category.specificationChecks.map((check) => check.label),
    [
      "Composition and yarn system",
      "GSM and seasonal weight",
      "Usable width and relaxation",
      "Stretch and recovery",
      "Loop-back structure and finish",
      "Shrinkage, pilling and colourfastness",
    ]
  );

  const guidance = category.developmentGuidance.join(" ");
  assert.match(guidance, /catalogue article/i);
  assert.match(guidance, /reference sample/i);
  assert.match(guidance, /specification-led/i);
  assert.match(guidance, /current quotation/i);

  assert.equal(category.faq.length, 6);
  const faqQuestions = new Set(category.faq.map((item) => item.question));
  for (const question of [
    "What garments use French terry fabric?",
    "Can O'range Textile support private-label hoodie fabrics?",
    "How is French terry different from brushed fleece?",
    "What GSM and usable width should a hoodie buyer specify?",
    "Which shrinkage and pilling checks matter for French terry?",
    "Can buyers customize composition, colour and reverse finish?",
  ]) {
    assert.ok(faqQuestions.has(question), `missing French terry FAQ: ${question}`);
  }

  const relatedRoutes = new Set(category.relatedLinks.map((link) => link.href));
  for (const route of [
    "/fabrics/rib-knit-fabric",
    "/fabrics/cotton-spandex-jersey",
    "/blog/french-terry-fabric-vs-fleece",
    "/blog/french-terry-fabric-for-hoodies",
    "/blog/heavyweight-french-terry-fabric",
    "/custom-knit-fabric-development",
  ]) {
    assert.ok(relatedRoutes.has(route), `missing French terry route: ${route}`);
  }

  assert.equal(
    category.procurement?.cta.label,
    "Request a French terry sample or quotation"
  );
  assert.equal(category.procurement?.cta.inquiryOptionId, "french-terry");
});

test("French terry evidence and FAQs keep claims attributable and bounded", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "fleece-french-terry"
  );

  assert.ok(category?.procurement);
  const { capability, qualitySteps, boundary } =
    category.procurement.evidence;

  assert.match(capability, /O'range Textile/);
  assert.match(capability, /buyer brief/i);
  assert.match(capability, /sample/i);
  assert.match(capability, /specification/i);
  assert.doesNotMatch(capability, /Jingtian|parent company|capacity/i);

  assert.match(
    boundary,
    /the supplied 104-record finished-fabric catalogue/i
  );
  assert.doesNotMatch(
    boundary,
    /historical\/draft|(?:current\s+)?owner-confirmed/i
  );
  assert.match(
    boundary,
    /does not verify[^.]*exact French terry article[^.]*specification/i
  );
  assert.match(boundary, /\bMOQ\b[^.]*\blead time\b[^.]*inquiry-specific/i);
  assert.doesNotMatch(
    [capability, ...qualitySteps, boundary].join(" "),
    /\bcapacity\b/i
  );

  assert.equal(category.faq.length, 6);
  for (const faq of category.faq) {
    assert.ok(faq.answer.trim().length >= 120, `${faq.question} needs a useful answer`);
    assert.match(
      faq.answer,
      /\b(?:buyer|brief|specif|sample|article|confirm|approve|test|composition|requirements?)\w*/i,
      `${faq.question} needs procurement guidance`
    );
  }

  const answersByQuestion = new Map(
    category.faq.map((faq) => [faq.question, faq.answer])
  );
  assert.match(
    category.sourcingOverview.join(" "),
    /brushed fleece commonly has a raised reverse, with one- or two-sided brushing depending on the article/i
  );
  assert.match(
    answersByQuestion.get("How is French terry different from brushed fleece?"),
    /brushed fleece commonly has a raised reverse, with one- or two-sided brushing depending on the article/i
  );
  const boundedAnswers = {
    "Can O'range Textile support private-label hoodie fabrics?":
      /confirmed in the current quotation/i,
    "How is French terry different from brushed fleece?":
      /depend on the exact article|compare labeled finished samples/i,
    "What GSM and usable width should a hoodie buyer specify?":
      /no universal|confirm/i,
    "Which shrinkage and pilling checks matter for French terry?":
      /state the intended|approve the actual article/i,
    "Can buyers customize composition, colour and reverse finish?":
      /confirmed for the specific inquiry|rather than promised/i,
  };

  for (const [question, boundaryPattern] of Object.entries(boundedAnswers)) {
    assert.match(
      answersByQuestion.get(question) ?? "",
      boundaryPattern,
      `${question} needs explicit confirmation or evidence boundaries`
    );
  }
});

test("French terry category does not publish fixed values or guarantees", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "fleece-french-terry"
  );

  assert.ok(category?.procurement);
  assertNoUnsupportedFixedClaims(category);
});

test("Cotton jersey category publishes a focused procurement brief", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-jersey"
  );

  assert.ok(category, "expected the Cotton jersey category in the public catalogue");
  assert.equal(category.name, "Cotton jersey fabrics");
  assert.equal(category.shortName, "Cotton jersey");
  assert.match(category.description, /^Cotton jersey fabric\b/);
  assert.match(category.description, /single-knit/i);
  assert.match(category.description, /vertical V-shaped stitch legs/i);
  assert.match(category.description, /horizontal stitch crowns/i);
  assert.doesNotMatch(category.description, /\breverse loops?\b|\bloop-back\b/i);
  for (const application of [
    "T-shirts",
    "Base layers",
    "Loungewear",
    "Private-label basics",
  ]) {
    assert.ok(
      category.applications.includes(application),
      `missing Cotton jersey application: ${application}`
    );
  }
  for (const buyerIntent of category.buyerIntent) {
    assert.match(
      buyerIntent,
      /^(?=.*\bcotton\b)(?=.*\bjersey\b).+$/i,
      `buyer intent must keep Cotton jersey primary: ${buyerIntent}`
    );
  }

  const sourcingOverview = category.sourcingOverview.join(" ");
  assert.doesNotMatch(sourcingOverview, /\byarn direction\b/i);
  assert.match(sourcingOverview, /\byarn (?:specification|system|count)\b/i);

  assert.deepEqual(
    category.specificationChecks.map((check) => check.label),
    [
      "Composition and yarn direction",
      "GSM and opacity",
      "Usable width",
      "Stretch and recovery",
      "Dyeing and surface finish",
      "Shrinkage, spirality, pilling and colourfastness",
    ]
  );
  const specificationByLabel = new Map(
    category.specificationChecks.map((check) => [check.label, check.detail])
  );
  const compositionDetail =
    specificationByLabel.get("Composition and yarn direction") ?? "";
  assert.match(compositionDetail, /fibre composition/i);
  assert.match(compositionDetail, /yarn count|linear density/i);
  assert.match(compositionDetail, /carded or combed preparation/i);
  assert.match(compositionDetail, /relevant spinning system/i);
  assert.match(compositionDetail, /twist|torque/i);
  assert.doesNotMatch(
    compositionDetail,
    /\bfibre direction\b|\bspinning direction\b/i
  );

  const stretchDetail =
    specificationByLabel.get("Stretch and recovery") ?? "";
  assert.match(stretchDetail, /construction-led stretch/i);
  assert.match(stretchDetail, /residual growth/i);
  assert.match(stretchDetail, /non-elastane/i);
  assert.match(stretchDetail, /elastane-supported stretch/i);
  assert.match(stretchDetail, /confirm/i);

  for (const check of category.specificationChecks) {
    assert.ok(
      check.detail.trim().length >= 100,
      `${check.label} needs enough detail to guide a buyer`
    );
    assert.match(
      check.detail,
      /\b(?:specify|state|provide|confirm|agree|define|share)\w*/i,
      `${check.label} must tell the buyer what to specify or confirm`
    );
  }

  const guidance = category.developmentGuidance.join(" ");
  assert.match(guidance, /catalogue article/i);
  assert.match(guidance, /reference sample/i);
  assert.match(guidance, /specification-led brief/i);
  assert.match(guidance, /current sample/i);
  assert.match(guidance, /current quotation/i);

  assert.equal(category.faq.length, 6);
  const faqQuestions = new Set(category.faq.map((item) => item.question));
  for (const question of [
    "What is cotton jersey fabric used for?",
    "Can overseas buyers request cotton jersey samples?",
    "How should buyers specify GSM and opacity for a cotton jersey T-shirt?",
    "What is the difference between 100% cotton and cotton-rich jersey?",
    "How should shrinkage and spirality be checked?",
    "Can buyers request custom colour, finish and usable width?",
  ]) {
    assert.ok(faqQuestions.has(question), `missing Cotton jersey FAQ: ${question}`);
  }

  const relatedRoutes = new Set(category.relatedLinks.map((link) => link.href));
  for (const route of [
    "/fabrics/cotton-spandex-jersey",
    "/fabrics/interlock-fabric",
    "/blog/interlock-vs-jersey-fabric",
    "/blog/what-is-interlock-fabric",
    "/blog/what-is-rib-knit-fabric",
    "/custom-knit-fabric-development",
  ]) {
    assert.ok(relatedRoutes.has(route), `missing Cotton jersey route: ${route}`);
  }

  assert.equal(
    category.procurement?.cta.label,
    "Request a cotton jersey sample or quotation"
  );
  assert.equal(category.procurement?.cta.inquiryOptionId, "cotton-jersey");
});

test("Cotton jersey evidence and FAQs keep claims attributable and bounded", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-jersey"
  );

  assert.ok(category?.procurement);
  const { capability, qualitySteps, boundary } =
    category.procurement.evidence;

  assert.match(capability, /O'range Textile/);
  assert.match(capability, /buyer brief/i);
  assert.match(capability, /sample/i);
  assert.match(capability, /specification/i);
  assert.doesNotMatch(capability, /Jingtian|parent company|capacity/i);

  assert.match(
    boundary,
    /the supplied 104-record finished-fabric catalogue/i
  );
  assert.doesNotMatch(
    boundary,
    /historical\/draft|(?:current\s+)?owner-confirmed/i
  );
  assert.match(
    boundary,
    /does not verify[^.]*exact cotton jersey article[^.]*specification/i
  );
  assert.match(
    boundary,
    /\bavailability\b[^.]*\bMOQ\b[^.]*\blead time\b[^.]*inquiry-specific/i
  );
  assert.doesNotMatch(
    [capability, ...qualitySteps, boundary].join(" "),
    /\bcapacity\b/i
  );
  const qualityEvidence = qualitySteps.join(" ");
  assert.match(qualityEvidence, /sewing trial/i);
  assert.match(qualityEvidence, /spirality/i);
  assert.match(qualityEvidence, /agreed wash(?:\/| and )dry method/i);

  assert.equal(category.faq.length, 6);
  for (const faq of category.faq) {
    assert.ok(faq.answer.trim().length >= 120, `${faq.question} needs a useful answer`);
    assert.match(
      faq.answer,
      /\b(?:buyer|brief|specif|sample|article|confirm|approve|test|garment|requirements?)\w*/i,
      `${faq.question} needs procurement guidance`
    );
  }

  const answersByQuestion = new Map(
    category.faq.map((faq) => [faq.question, faq.answer])
  );
  const boundedAnswers = {
    "Can overseas buyers request cotton jersey samples?":
      /catalogue article|reference sample|specification-led brief/i,
    "How should buyers specify GSM and opacity for a cotton jersey T-shirt?":
      /no universal|confirm/i,
    "What is the difference between 100% cotton and cotton-rich jersey?":
      /does not by itself|confirm/i,
    "How should shrinkage and spirality be checked?":
      /test method|approve/i,
    "Can buyers request custom colour, finish and usable width?":
      /confirmed for the (?:specific )?inquiry|not assumed/i,
  };

  for (const [question, boundaryPattern] of Object.entries(boundedAnswers)) {
    assert.match(
      answersByQuestion.get(question) ?? "",
      boundaryPattern,
      `${question} needs explicit confirmation or evidence boundaries`
    );
  }
});

test("Cotton jersey category does not publish fixed values or guarantees", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-jersey"
  );

  assert.ok(category?.procurement);
  assertNoUnsupportedFixedClaims(category, {
    allowExactCottonComposition: true,
  });
});

test("Cotton spandex jersey category publishes a focused procurement brief", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-spandex-jersey"
  );

  assert.ok(
    category,
    "expected the Cotton spandex jersey category in the public catalogue"
  );
  assert.equal(category.name, "Cotton spandex jersey fabrics");
  assert.equal(category.shortName, "Cotton spandex jersey");
  assert.match(category.description, /^Cotton spandex jersey fabric\b/);
  assert.match(category.description, /\b(?:single-knit|single jersey)\b/i);
  assert.match(
    category.description,
    /\b(?:fitted tees|childrenswear|loungewear|movement-led apparel)\b/i
  );
  assert.ok(
    category.buyerIntent.length >= 1,
    "Cotton spandex jersey needs at least one focused buyer intent"
  );
  for (const buyerIntent of category.buyerIntent) {
    assertMatchesAll(
      buyerIntent,
      [/\bcotton\b/i, /\bspandex\b/i, /\bjersey\b/i],
      `Cotton spandex jersey buyer intent: ${buyerIntent}`
    );
  }

  const expectedSpecificationChecks = [
    [
      "Cotton and spandex composition",
      [/composition disclosure[\s\S]*does not[\s\S]*performance/i],
    ],
    [
      "GSM and opacity",
      [/GSM[\s\S]*opacity[\s\S]*(?:conditioning|relaxation)/i],
    ],
    [
      "Usable width after relaxation",
      [/usable width[\s\S]*(?:conditioning|relaxation)/i],
    ],
    [
      "Stretch direction and recovery",
      [
        /stretch direction[\s\S]*method[\s\S]*(?:recovery|growth)[\s\S]*(?:criteria|tolerance)/i,
      ],
    ],
    [
      "Dyeing, heat history and finish",
      [/(?:dye|dyeing)[\s\S]*heat[\s\S]*finish/i],
    ],
    [
      "Shrinkage, torque, pilling and colourfastness",
      [/garment[\s\S]*test method[\s\S]*tolerance/i],
    ],
  ];
  assert.deepEqual(
    category.specificationChecks.map((check) => check.label),
    expectedSpecificationChecks.map(([label]) => label)
  );
  const specificationDetails = new Map(
    category.specificationChecks.map((check) => [check.label, check.detail])
  );
  const compositionSpecification =
    specificationDetails.get("Cotton and spandex composition") ?? "";
  assertMatchesAll(
    compositionSpecification,
    [
      /(?:fibre (?:composition|content)|composition (?:and|or) ratio)/i,
      /(?:yarn count|linear density|yarn (?:specification|system))/i,
      /construction/i,
      /cotton/i,
      /(?:spandex|elastane)/i,
    ],
    "Cotton and spandex composition detail"
  );
  for (const [label, patterns] of expectedSpecificationChecks) {
    assertMatchesAll(
      specificationDetails.get(label) ?? "",
      patterns,
      `${label} detail`
    );
  }

  const developmentCopy = category.developmentGuidance.join(" ");
  assertMatchesAll(
    developmentCopy,
    [
      /catalogue article/i,
      /reference sample/i,
      /specification-led brief/i,
      /current exact article/i,
      /current sample/i,
      /current quotation/i,
    ],
    "Cotton spandex jersey development guidance"
  );

  const relatedRoutes = new Map(
    category.relatedLinks.map((link) => [link.href, link])
  );
  for (const route of [
    "/fabrics/cotton-jersey",
    "/fabrics/rib-knit-fabric",
    "/blog/interlock-vs-jersey-fabric",
    "/blog/what-is-interlock-fabric",
    "/blog/what-is-rib-knit-fabric",
    "/custom-knit-fabric-development",
  ]) {
    assert.ok(relatedRoutes.has(route), `missing Cotton spandex route: ${route}`);
  }
  const customDevelopmentCopy =
    relatedRoutes.get("/custom-knit-fabric-development")?.description ?? "";
  assertMatchesAll(
    customDevelopmentCopy,
    [
      /catalogue article/i,
      /reference sample/i,
      /specification-led brief/i,
      /current (?:sample|quotation)/i,
    ],
    "Cotton spandex jersey custom-development link"
  );

  assert.equal(
    category.procurement?.cta.label,
    "Request a cotton spandex jersey sample or quotation"
  );
  assert.equal(
    category.procurement?.cta.inquiryOptionId,
    "cotton-spandex-jersey"
  );
});

test("Cotton spandex jersey uses executable RFQ terminology throughout", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-spandex-jersey"
  );

  assert.ok(category);
  const buyerVisibleCopy = [
    collectCategoryClaims(category),
    ...category.buyerIntent,
    ...category.applications,
    ...category.specificationChecks.map((check) => check.label),
    ...category.relatedLinks.map((link) => link.label),
    ...category.faq.map((faq) => faq.question),
  ].join(" ");
  assert.doesNotMatch(
    buyerVisibleCopy,
    /\b(?:yarn direction|composition direction|fibre direction)\b/i
  );
});

test("Cotton spandex jersey evidence and FAQs stay attributable and bounded", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-spandex-jersey"
  );

  assert.ok(category?.procurement);
  const { capability, qualitySteps, boundary } =
    category.procurement.evidence;
  assert.doesNotMatch(
    collectCategoryClaims(category),
    /Jingtian|parent company|\bcapacity\b/i,
    "Cotton spandex jersey category claims must not attribute category-specific capacity"
  );
  assertMatchesAll(
    capability,
    [/O'range Textile/, /buyer brief/i, /sample/i, /specification/i],
    "Cotton spandex jersey capability evidence"
  );
  assert.doesNotMatch(capability, /Jingtian|parent company|capacity/i);

  assertMatchesAll(
    boundary,
    [
      /the supplied 104-record finished-fabric catalogue/i,
      /current exact cotton spandex jersey article/i,
      /specification/i,
      /availability/i,
      /\bMOQ\b/i,
      /lead time/i,
      /inquiry-specific/i,
    ],
    "Cotton spandex jersey evidence boundary"
  );
  assert.doesNotMatch(
    boundary,
    /historical\/draft|(?:current\s+)?owner-confirmed/i
  );

  const qualityEvidence = qualitySteps.join(" ");
  assertMatchesAll(
    qualityEvidence,
    [
      /finished sample/i,
      /agreed (?:method|criteria|tolerance)/i,
      /current quotation/i,
    ],
    "Cotton spandex jersey quality steps"
  );

  const expectedFaqQuestions = [
    "Why use spandex in cotton jersey?",
    "Does O'range Textile supply cotton-rich stretch knits?",
    "How should stretch direction and recovery be specified?",
    "Does a 95/5 composition guarantee the same performance?",
    "When should GSM and usable width be measured?",
    "Can buyers request custom colour, finish and testing?",
  ];
  assert.deepEqual(
    category.faq.map((faq) => faq.question),
    expectedFaqQuestions
  );
  for (const faq of category.faq) {
    assert.ok(
      faq.answer.trim().length >= 120,
      `${faq.question} needs a useful procurement answer`
    );
    assert.match(
      faq.answer,
      /\b(?:buyer|brief|specif|sample|article|confirm|approve|test|garment|method|requirements?)\w*/i,
      `${faq.question} needs procurement guidance`
    );
  }

  const answersByQuestion = new Map(
    category.faq.map((faq) => [faq.question, faq.answer])
  );
  const ratioAnswer =
    answersByQuestion.get(
      "Does a 95/5 composition guarantee the same performance?"
    ) ?? "";
  assertMatchesAll(
    ratioAnswer,
    [
      /ratio alone does not establish/i,
      /construction/i,
      /yarn/i,
      /elastane/i,
      /density/i,
      /heat/i,
      /finish/i,
      /relaxation/i,
      /method/i,
      /stretch/i,
      /recovery/i,
      /opacity/i,
      /hand/i,
      /dimensional/i,
    ],
    "Cotton spandex jersey composition-ratio answer"
  );

  const answerContracts = {
    "How should stretch direction and recovery be specified?":
      /direction[\s\S]*method[\s\S]*(?:recovery|growth)[\s\S]*(?:criteria|tolerance)/i,
    "When should GSM and usable width be measured?":
      /conditioning[\s\S]*relaxation[\s\S]*(?:sample|article)/i,
    "Can buyers request custom colour, finish and testing?":
      /specific inquiry|current quotation/i,
  };
  for (const [question, answerPattern] of Object.entries(answerContracts)) {
    assert.match(answersByQuestion.get(question) ?? "", answerPattern);
  }
});

test("Cotton spandex jersey category does not publish fixed values or guarantees", async () => {
  const { publicFabricCategories } = await loadPublicCatalog();
  const category = publicFabricCategories.find(
    (item) => item.slug === "cotton-spandex-jersey"
  );

  assert.ok(category?.procurement);
  assertNoUnsupportedFixedClaims(category);
});

test("legacy category related fabric IDs resolve to a runtime public fabric record", async () => {
  const { publicFabricCategories, publicFabrics } = await loadPublicCatalog();
  const publicFabricIds = new Set(publicFabrics.map((fabric) => fabric.id));

  for (const category of publicFabricCategories) {
    for (const id of category.relatedFabricIds) {
      assert.ok(
        publicFabricIds.has(id),
        `related fabric ID ${id} must exist in publicFabrics`
      );
    }
  }
});

test("category CTAs forward a valid fabric option through the inquiry flow", async () => {
  const [categoryPage, sampleRequestCta, inquiryProvider, inquiryModal] = await Promise.all([
    readSource("app/fabrics/[slug]/page.tsx"),
    readSource("components/SampleRequestCta.tsx"),
    readSource("components/InquiryProvider.tsx"),
    readSource("components/ui/InquiryModal.tsx"),
  ]);
  const { finishedFabricInquiryOptions } = await loadInquiryOptions();
  const expectedInquiryOptions = {
    "french-terry": "French terry fabric",
    "cotton-jersey": "Cotton jersey fabric",
    "cotton-spandex-jersey": "Cotton spandex jersey fabric",
  };

  assert.match(categoryPage, /import \{ SampleRequestCta \} from "@\/components\/SampleRequestCta"/);
  assert.match(categoryPage, /companyRelationship,\s*manufacturingScale/);
  assert.match(categoryPage, /category\.procurement\.evidence\.capability/);
  assert.match(categoryPage, /category\.procurement\.evidence\.qualitySteps\.map/);
  assert.match(categoryPage, /category\.procurement\.evidence\.boundary/);
  assert.match(categoryPage, /category\.procurement\.cta\.heading/);
  assert.match(categoryPage, /category\.procurement\.cta\.body/);
  assert.match(categoryPage, /<SampleRequestCta[\s\S]*?label=\{category\.procurement\.cta\.label\}/);
  assert.match(categoryPage, /fabricId=\{category\.procurement\.cta\.inquiryOptionId\}/);
  assert.match(categoryPage, /href="\/custom-knit-fabric-development"/);
  assert.match(sampleRequestCta, /fabricId\?: string/);
  assert.match(sampleRequestCta, /openInquiry\(fabricId\)/);
  assert.match(inquiryProvider, /openInquiry: \(initialFabricId\?: string\) => void/);
  assert.match(inquiryProvider, /setInitialFabricId\(fabricId\)/);
  assert.match(inquiryProvider, /<InquiryModal[\s\S]*?initialFabricId=\{initialFabricId\}/);
  assert.match(inquiryModal, /initialFabricId\?: string/);
  assert.match(inquiryModal, /inquiryOptions\.some\(\(option\) => option\.id === initialFabricId\)/);
  assert.match(inquiryModal, /setFabricId\(.*initialFabricId.*finished-range/s);
  assert.match(inquiryModal, /value=\{fabricId\}/);

  for (const [id, name] of Object.entries(expectedInquiryOptions)) {
    assert.equal(
      finishedFabricInquiryOptions.find((option) => option.id === id)?.name,
      name,
      `inquiry options must include ${id}`
    );
  }
});

test("ready-stock page provides a second crawlable entry to legacy categories", async () => {
  const landing = await readSource("components/landing/ReadyStockLanding.tsx");

  assert.match(landing, /getPublicFabricCategories/);
  assert.match(landing, /publicCategories\.map/);
  assert.match(landing, /href=\{`\/fabrics\/\$\{category\.slug\}`\}/);
});

test("catalogue routes bound the server payload and hydrate the complete catalogue", async () => {
  const catalogue = await readSource("lib/public-catalog.ts");
  const fabricsPage = await readSource("app/fabrics/page.tsx");
  const readyStockPage = await readSource(
    "app/ready-stock-knit-fabrics/page.tsx"
  );
  const catalogComponent = await readSource("components/FabricsCatalog.tsx");

  assert.match(catalogue, /INITIAL_CATALOGUE_SIZE\s*=\s*4/);
  assert.match(catalogue, /getInitialPublicFabrics/);
  assert.match(catalogue, /getPublicFabricCount/);
  assert.match(fabricsPage, /getInitialPublicFabrics/);
  assert.match(fabricsPage, /getPublicFabricCount/);
  assert.doesNotMatch(fabricsPage, /const fabrics = getPublicFabrics\(\)/);
  assert.match(readyStockPage, /getInitialPublicFabrics/);
  assert.match(readyStockPage, /getPublicFabricCount/);
  assert.match(catalogComponent, /fetch\("\/api\/fabrics"/);
  assert.match(catalogComponent, /totalFabricCount/);
});

test("catalogue landing routes publish page-specific sourcing evidence", async () => {
  const fabricsPage = await readSource("app/fabrics/page.tsx");
  const readyStockLanding = await readSource(
    "components/landing/ReadyStockLanding.tsx"
  );

  assert.match(fabricsPage, /What the catalogue confirms/);
  assert.match(fabricsPage, /What still requires sample approval/);
  assert.match(fabricsPage, /What makes an RFQ actionable/);
  assert.match(fabricsPage, /How to shortlist a finished knit fabric/);
  assert.match(fabricsPage, /Build an approval record/);
  assert.match(readyStockLanding, /How availability is confirmed/);
  assert.match(readyStockLanding, /Article match/);
  assert.match(readyStockLanding, /Commercial confirmation/);
  assert.match(readyStockLanding, /From catalogue reference to confirmed supply/);
  assert.match(readyStockLanding, /Questions to settle before price confirmation/);
});

test("client locale state preserves route-specific metadata titles", async () => {
  const localeProvider = await readSource("components/LocaleProvider.tsx");

  assert.doesNotMatch(localeProvider, /document\.title\s*=/);
});
