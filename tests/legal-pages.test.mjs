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
  assert.equal(PRIVACY_CONTENT.effectiveDate, "August 3, 2026");
  assert.equal(TERMS_CONTENT.effectiveDate, "August 3, 2026");

  const privacy = PRIVACY_CONTENT.sections.flatMap((section) => section.paragraphs).join("\n");
  const terms = TERMS_CONTENT.sections.flatMap((section) => section.paragraphs).join("\n");

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
