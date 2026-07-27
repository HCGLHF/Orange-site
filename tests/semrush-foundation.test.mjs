import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

const loadPublicCatalog = () =>
  import(new URL("../lib/public-catalog.ts", import.meta.url).href);

const loadInquiryOptions = () =>
  import(new URL("../lib/data.ts", import.meta.url).href);

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

  assert.match(boundary, /historical\/draft catalogue/i);
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
  const claimsText = [
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

  assert.doesNotMatch(
    claimsText,
    /\b\d+(?:\.\d+)?\s*(?:gsm|g\/m(?:2|²)|cm|mm|in(?:ch(?:es)?)?|%|kg|lb(?:s)?|cycles?|grade)\b/i
  );
  assert.doesNotMatch(
    claimsText,
    /\b(?:certified|certification|certificate|guarantees?|ensures?|always|never)\b/i
  );
  assert.doesNotMatch(claimsText, /\bcapacity\b/i);
  for (const fixedCommercialPattern of [
    /\bfixed\s+(?:MOQ|lead time|capacity)\b/i,
    /(?:\bMOQ\b|\blead time\b)[^.!?]{0,25}\b\d+(?:\.\d+)?\b/i,
    /\b\d+(?:\.\d+)?\b[^.!?]{0,25}(?:\bMOQ\b|\blead time\b)/i,
  ]) {
    assert.doesNotMatch(claimsText, fixedCommercialPattern);
  }

  const commercialTermSentences =
    claimsText
      .match(/[^.!?]*(?:\bMOQ\b|\blead time\b|\bcapacity\b)[^.!?]*[.!?]?/gi) ??
    [];
  for (const sentence of commercialTermSentences) {
    assert.match(
      sentence,
      /\b(?:confirm|inquiry-specific|not verif|rather than promised)\w*/i,
      `commercial terms must remain inquiry-specific: ${sentence}`
    );
  }
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
