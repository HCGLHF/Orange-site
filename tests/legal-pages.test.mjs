import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const readSource = async (relativePath) => {
  const url = new URL(`../${relativePath}`, import.meta.url);
  assert.ok(existsSync(url), `${relativePath} must exist`);
  return readFile(url, "utf8");
};

const sourceFilesUnder = async (relativeDirectory) => {
  const files = [];

  const walk = async (directoryUrl) => {
    for (const entry of await readdir(directoryUrl, { withFileTypes: true })) {
      const entryUrl = new URL(entry.isDirectory() ? `${entry.name}/` : entry.name, directoryUrl);
      if (entry.isDirectory()) {
        await walk(entryUrl);
      } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
        files.push(entryUrl);
      }
    }
  };

  await walk(new URL(`../${relativeDirectory}/`, import.meta.url));
  return files;
};

const privacyTitles = [
  "Who we are",
  "Information you provide",
  "Browser storage",
  "Essential security and server logs",
  "Analytics by default",
  "Accepting Analytics cookies",
  "What Analytics receives",
  "Providers and international processing",
  "Retention",
  "Your choices and requests",
  "Changes and contact",
];

const termsTitles = [
  "Using this website",
  "Informational fabric content",
  "Inquiries and orders",
  "Intellectual property",
  "Acceptable use",
  "External services",
  "Disclaimer",
  "Limitation of liability",
  "Changes and contact",
];

test("typed legal content contains every reviewed section and required disclosure", async () => {
  const { PRIVACY_CONTENT, TERMS_CONTENT } = await import(
    "../lib/legal-content.ts"
  );

  assert.deepEqual(
    PRIVACY_CONTENT.sections.map((section) => section.title),
    privacyTitles
  );
  assert.deepEqual(
    TERMS_CONTENT.sections.map((section) => section.title),
    termsTitles
  );
  assert.equal(PRIVACY_CONTENT.effectiveDate, "August 25, 2026");
  assert.equal(TERMS_CONTENT.effectiveDate, "August 3, 2026");

  const privacy = PRIVACY_CONTENT.sections.flatMap((section) => section.paragraphs).join("\n");
  const terms = TERMS_CONTENT.sections.flatMap((section) => section.paragraphs).join("\n");

  const essentialSecurityLogs = PRIVACY_CONTENT.sections.find(
    (section) => section.id === "essential-security-logs"
  );
  assert.ok(essentialSecurityLogs, "essential security logs section must exist");
  assert.equal(
    essentialSecurityLogs.paragraphs[0],
    "When you visit the website, our hosting and security provider may process your IP address, request date and time, User-Agent, requested path, response status, referrer where available, and related security signals. This processing continues if you decline Analytics cookies or have not made a choice. We use this information only to deliver and protect the website, identify automated or abusive traffic, investigate security incidents, and diagnose availability or technical problems. We do not use these logs for advertising or cross-site profiling. We do not add IP addresses to Google Analytics event data. When your browser connects to Google Analytics, Google may use the source IP at collection time to derive location information and states that it discards the IP before Analytics data is logged. Full IP addresses used for our own security analysis remain within Vercel's hosting and security layer; O'range Textile does not create a separate application IP database. Security logs available to us are retained for no more than 30 days, or for a shorter period when required by platform availability."
  );

  const providers = PRIVACY_CONTENT.sections.find(
    (section) => section.id === "providers-and-international-processing"
  );
  assert.ok(providers, "providers section must exist");
  assert.equal(
    providers.paragraphs[0],
    "Vercel hosts and protects the website and may process the essential security and server-log information described above. Google provides GA4 and Google Tag Manager. Inquiry details are sent to O'range Textile and its email delivery provider so we can respond. These providers may process information in countries outside your location under their own terms and privacy arrangements."
  );

  const browserStorage = PRIVACY_CONTENT.sections.find(
    (section) => section.id === "browser-storage"
  );
  assert.ok(browserStorage, "browser storage section must exist");
  assert.equal(
    browserStorage.paragraphs[0],
    "The website stores your Analytics choice in a dedicated versioned localStorage record. Inquiry details are sent to O'range Textile and its email delivery provider so we can respond. They are not retained in browser storage after submission."
  );

  const retention = PRIVACY_CONTENT.sections.find(
    (section) => section.id === "retention"
  );
  assert.ok(retention, "retention section must exist");
  assert.equal(
    retention.paragraphs[0],
    "Security logs available to us are retained for no more than 30 days, or for a shorter period when required by platform availability. GA4 event-level data retention is set to two months. Inquiry information is retained only for as long as reasonably required to respond, keep business records and meet applicable obligations; O'range Textile has not represented a more specific public retention schedule."
  );

  const choices = PRIVACY_CONTENT.sections.find(
    (section) => section.id === "your-choices-and-requests"
  );
  assert.ok(choices, "your choices section must exist");
  assert.equal(
    choices.paragraphs[0],
    "You can reopen the choice bar at any time through Privacy settings in the footer. Declining withdraws permission for Analytics cookies but retains the limited cookieless measurement described above. Declining Analytics cookies or not making a choice does not stop necessary security logging described in this policy."
  );

  for (const required of [
    "Shaoxing Shicheng Textile Products Co., Ltd.",
    "Google Analytics 4",
    "Google Tag Manager",
    "cookieless measurement",
    "analytics storage",
    "Advertising storage",
    "advertising user data",
    "advertising personalisation",
    "Google Signals",
    "user-provided data collection",
    "email delivery provider",
    "not retained in browser storage after submission",
    "localStorage",
    "two months",
    "Privacy settings",
    "folenchen0401@outlook.com",
    "We do not describe this processing as anonymous.",
    "IP address",
    "request date and time",
    "User-Agent",
    "requested path",
    "response status",
    "referrer where available",
    "related security signals",
    "decline Analytics cookies or have not made a choice",
    "Vercel",
    "advertising or cross-site profiling",
    "We do not add IP addresses to Google Analytics event data.",
    "may use the source IP at collection time",
    "discards the IP before Analytics data is logged",
    "does not create a separate application IP database",
    "no more than 30 days",
    "does not stop necessary security logging",
    "request access",
    "correction",
    "privacy complaint",
  ]) {
    assert.ok(privacy.includes(required), `privacy must disclose ${required}`);
  }
  assert.match(
    privacy,
    /privacy complaint[\s\S]*folenchen0401@outlook\.com/i,
    "privacy must provide one confirmed contact route for complaints",
  );
  assert.doesNotMatch(privacy, /inquiry information is retained for exactly/i);
  assert.doesNotMatch(`${privacy}\n${terms}`, /Formspree/i);

  assert.ok(
    terms.includes(
      "Submitting an inquiry asks O'range Textile to review a possible sourcing requirement. It does not create an order, reservation, exclusivity arrangement or binding supply contract. Composition, GSM, usable width, colour, finish, sample route, testing, quantity, stock status, price, lead time, capacity, documentation and delivery terms require current written confirmation for the specific inquiry."
    )
  );
});

test("active production source has no legacy Formspree or inquiry PII storage API", async () => {
  const forbiddenLegacyInquiry =
    /formspree\.io|FORMSPREE_INQUIRY_ENDPOINT|appendInquiryRecord|orange-textile-inquiries/i;
  const productionSources = (
    await Promise.all(["app", "components", "lib"].map(sourceFilesUnder))
  ).flat();

  for (const sourceUrl of productionSources) {
    const source = await readFile(sourceUrl, "utf8");
    assert.doesNotMatch(
      source,
      forbiddenLegacyInquiry,
      `${sourceUrl.pathname} must not contain legacy inquiry submission or storage code`,
    );
  }

  assert.equal(
    existsSync(new URL("../lib/inquiry-storage.ts", import.meta.url)),
    false,
    "the unused buyer-PII browser storage module must be removed",
  );

  for (const relativePath of [
    "components/InquiryBar.tsx",
    "components/ui/InquiryModal.tsx",
  ]) {
    const source = await readSource(relativePath);
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage/,
      `${relativePath} must not write inquiry details to browser storage`,
    );
  }
});

test("inquiry UI copy and E2E interception describe the current server path", async () => {
  const messagesSource = await readSource("lib/i18n.ts");
  assert.doesNotMatch(messagesSource, /submissions? (?:are )?saved on (?:this |your )?device/i);
  assert.doesNotMatch(messagesSource, /NEXT_PUBLIC_INQUIRY_EMAIL/);

  const e2eSource = await readSource("e2e/analytics-consent.spec.ts");
  assert.match(e2eSource, /page\.route\(["']\*\*\/api\/inquiry["']/);
  assert.match(e2eSource, /inquiryId:\s*["']email_test_123["']/);
  assert.doesNotMatch(e2eSource, /formspree/i);
});

test("current inquiry documentation describes the server email route", async () => {
  const designQa = await readSource("design-qa.md");
  assert.match(designQa, /intercepts and fulfils the `\/api\/inquiry` request locally/i);
  assert.doesNotMatch(designQa, /Formspree/i);

  const architecture = await readSource("docs/architecture.md");
  assert.match(architecture, /Inquiry API:[^\n]*`lib\/inquiry-email\.ts`/);
  assert.doesNotMatch(
    architecture,
    /Inquiry API:[^\n]*`lib\/notion-inquiry-api\.ts`/,
  );
});

test("LegalPage provides one registry H1, linked sections, effective date and contact link", async () => {
  const source = await readSource("components/legal/LegalPage.tsx");

  assert.equal([...source.matchAll(/<h1\b/g)].length, 1);
  assert.match(source, /<h1[^>]*>\s*\{seo\.h1\}\s*<\/h1>/);
  assert.match(source, /Effective date:[\s\S]{0,100}\{content\.effectiveDate\}/);
  assert.match(source, /href=\{`#\$\{section\.id\}`\}/);
  assert.match(source, /id=\{section\.id\}/);
  assert.match(source, /const CONTACT_EMAIL = ["']folenchen0401@outlook\.com["']/);
  assert.match(source, /href=\{`mailto:\$\{CONTACT_EMAIL\}`\}/);
  assert.match(source, /max-w-(?:3xl|4xl|5xl)/);
});

test("privacy and terms routes are static, registry-driven pages", async () => {
  for (const [path, contentName] of [
    ["privacy", "PRIVACY_CONTENT"],
    ["terms", "TERMS_CONTENT"],
  ]) {
    const source = await readSource(`app/${path}/page.tsx`);
    assert.match(source, /export const dynamic = ["']force-static["']/);
    assert.match(source, new RegExp(`getPublicPageSeo\\(["']\\/${path}["']\\)`));
    assert.match(source, /createPageMetadata\(seo\)/);
    assert.match(source, new RegExp(`<LegalPage\\s+seo=\\{seo\\}\\s+content=\\{${contentName}\\}\\s*\\/>`));
  }
});

test("footer exposes legal links and one Privacy settings control without changing primary navigation", async () => {
  const source = await readSource("components/ui/SiteFooter.tsx");

  assert.match(source, /href:\s*["']\/privacy["'],\s*label:\s*["']Privacy Policy["']/);
  assert.match(source, /href:\s*["']\/terms["'],\s*label:\s*["']Terms of Service["']/);
  assert.match(source, /import\s*\{\s*PrivacySettingsButton\s*\}/);
  assert.equal([...source.matchAll(/<PrivacySettingsButton\s*\/>/g)].length, 1);
  assert.match(source, /<li>\s*<PrivacySettingsButton\s*\/>\s*<\/li>/);
});
