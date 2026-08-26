import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = async (relativePath) => {
  const url = new URL(`../${relativePath}`, import.meta.url);
  assert.ok(existsSync(url), `${relativePath} must exist`);
  return readFile(url, "utf8");
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
    "Vercel hosts and protects the website and may process the essential security and server-log information described above. Google provides GA4 and Google Tag Manager. Formspree receives website inquiry submissions, and Notion may receive them when that integration is configured. These providers may process information in countries outside your location under their own terms and privacy arrangements."
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
    "Formspree",
    "Notion",
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

  assert.ok(
    terms.includes(
      "Submitting an inquiry asks O'range Textile to review a possible sourcing requirement. It does not create an order, reservation, exclusivity arrangement or binding supply contract. Composition, GSM, usable width, colour, finish, sample route, testing, quantity, stock status, price, lead time, capacity, documentation and delivery terms require current written confirmation for the specific inquiry."
    )
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
