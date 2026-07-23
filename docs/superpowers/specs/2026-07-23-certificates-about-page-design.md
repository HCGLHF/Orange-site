# Certificates and About Page Design

**Date:** 2026-07-23  
**Status:** Approved for implementation planning  
**Site:** https://orangetextiles.com  
**Audience:** Global English-speaking B2B fabric buyers, with the United States and Australia as priority markets

## 1. Objective

Add a concise certificate trust signal to the homepage and create an evidence-led About Us page that explains the relationship between the operating company and its parent manufacturing company.

The work must increase buyer confidence without publishing the supplied machine-inventory photograph or the full GRS PDF, overstating production capacity, or implying that every product and shipment is GRS certified.

## 2. Confirmed Company Facts

- O'range Textile is the customer-facing B2B brand operated by Shaoxing Shicheng Textile Products Co., Ltd.
- Shaoxing Shicheng Textile Products Co., Ltd. is a subsidiary of Shaoxing Jingtian Textile Technology Co., Ltd.
- Shaoxing Shicheng Textile Products Co., Ltd. focuses on foreign trade and services international buyers.
- The supplied machine inventory belongs to Shaoxing Jingtian Textile Technology Co., Ltd.
- The supplied GRS scope certificate is held by Shaoxing Jingtian Textile Technology Co., Ltd., not by Shaoxing Shicheng Textile Products Co., Ltd.

## 3. Evidence Boundaries

### 3.1 Machine inventory

The supplied source document records 221 circular knitting machines across 17 configurations:

- 63 84-feeder double-knit machines
- 44 72-feeder rib machines
- 114 72-feeder double-knit machines

The original photograph must not be published. Public copy will use buyer-friendly, deliberately rounded figures:

- 200+ circular knitting machines
- 17 machine configurations
- 60+ 84-feeder double-knit machines
- 40+ 72-feeder rib machines
- 100+ 72-feeder double-knit machines

The site must not introduce an unsupported `50+` claim or convert machine counts into daily, monthly, or annual production volume.

### 3.2 GRS scope certificate

The supplied certificate supports the following public facts:

- Certificate holder: Shaoxing Jingtian Textile Technology Co., Ltd.
- Certification body: TÜV Rheinland (China) Ltd.
- Standard: Global Recycled Standard (GRS) v4.0
- Scope Certificate No.: TRC-GRS-350849-00
- Product category: Greige fabrics
- Product detail: Knitted fabrics
- Certified process: Knitting
- Valid until: 2027-04-19

The homepage and About page may summarize these facts, but must not publish or link to the supplied PDF.

The public wording must explain that the parent company holds the scope certificate. It must not present Shaoxing Shicheng Textile Products Co., Ltd. or every O'range Textile product as independently GRS certified. Any shipment-level GRS claim requires the applicable valid Transaction Certificate or equivalent supporting documentation.

## 4. Selected Information Architecture

The selected approach is a lightweight homepage trust section plus a detailed `/about` page.

### 4.1 Homepage

Add a compact certificate section titled `GRS Scope Documentation`.

The section will:

- identify the parent company as the certificate holder;
- state that the scope covers greige knitted fabrics and knitting;
- avoid the full certificate image, PDF download, and detailed equipment data;
- include a `Learn About Our Company` link to `/about`;
- use an `h2`, preserving the homepage's existing single `h1`;
- remain visually subordinate to the homepage's primary product and inquiry journeys.

Recommended copy direction:

> Our parent company, Shaoxing Jingtian Textile Technology Co., Ltd., holds a GRS v4.0 scope certificate covering greige knitted fabrics and knitting. Documentation for applicable sourcing requests is reviewed case by case; shipment-level claims require valid transaction documentation.

This is a content direction rather than immutable final wording. Implementation may make small readability edits without changing the evidence boundaries.

### 4.2 About Us page

Create a new public route at `/about` with these sections:

1. **Hero and positioning**  
   Introduce O'range Textile as an export-focused knit fabric sourcing business serving international B2B buyers.

2. **Company relationship**  
   Explain that Shaoxing Shicheng Textile Products Co., Ltd. is the export-focused subsidiary of Shaoxing Jingtian Textile Technology Co., Ltd. Clearly distinguish customer-facing export service from the parent company's manufacturing and certificate-holder role.

3. **Documented manufacturing scale**  
   Present the rounded machine figures in accessible metric cards. Do not show the source photograph or claim unverified production output.

4. **Knitting capabilities**  
   Describe supported directions such as Ponte Roma, air-layer, double-knit, interlock, and rib fabrics. Link to relevant existing catalogue and product-cluster pages instead of duplicating their detailed commercial content.

5. **GRS scope documentation**  
   Summarize the certificate holder, standard, certification body, applicable scope, and validity. Include the Transaction Certificate qualification.

6. **International buyer support**  
   Describe specification review, sampling, quotation, colour and finish confirmation, testing requirements, and export communication for global buyers, including US and Australian sourcing teams.

7. **Inquiry call to action**  
   Ask buyers to provide intended use, composition, GSM, usable width, colour, quantity, finish, and testing requirements.

## 5. Visual Design

- Do not display the machine inventory photograph.
- Do not display a scan or preview of the certificate.
- Use typography, understated icons, certificate-detail rows, relationship copy, and metric cards.
- Match the existing orange, charcoal, cream, and white visual system.
- Keep the homepage treatment compact.
- Give the About page enough whitespace to feel credible and institutional rather than promotional.
- Ensure all interactive controls have visible focus states and useful accessible labels.
- New decorative graphics must use accessible decorative semantics. Any informational image added later must have a descriptive `alt`.

## 6. SEO Design

Add `/about` to the unified SEO registry.

- **primaryKeyword:** `O'range Textile`
- **secondaryKeywords:** `Shaoxing knit fabric company`, `China knit fabric supplier`, `knit fabric export company`
- **searchIntent:** `navigational`
- **topicCluster:** `company-trust`
- **targetPageType:** `about`
- **metaTitle:** `O'range Textile | Knit Fabric Company in Shaoxing`
- **h1:** `O'range Textile: Export-Focused Knit Fabric Sourcing`

The final meta description must:

- begin naturally with or contain the complete primary keyword;
- be unique;
- be between 160 and 300 characters;
- explain the parent-subsidiary relationship, documented knitting scale, GRS scope documentation, and international buyer support;
- avoid unsupported superlatives or certification claims.

This keyword allocation is intentionally navigational. It does not compete with:

- `/` — `double knit fabric`
- `/finished-double-knit-fabrics` — `double knit fabric manufacturer`
- `/fabrics` — `finished knit fabrics`

The new page must receive its canonical, Open Graph metadata, Twitter metadata, sitemap entry, and server-rendered metadata from the existing unified SEO data source.

## 7. Navigation and Internal Linking

- Add an About link to the global footer.
- Link to `/about` from the new homepage certificate section.
- Avoid adding another icon to the already dense mobile top navigation.
- Add contextual links from `/about` to the finished fabrics catalogue, double-knit manufacturing page, custom development page, and inquiry destination where useful.
- Add `/about` to machine-readable site discovery content if the project currently exposes such a list.

## 8. Structured Data

Preserve all existing structured data.

The About page should add an `AboutPage` graph node and company relationship data using the existing schema approach:

- O'range Textile / Shaoxing Shicheng Textile Products Co., Ltd. as the customer-facing export business;
- Shaoxing Jingtian Textile Technology Co., Ltd. as its parent organization;
- no schema statement implying the subsidiary is the GRS certificate holder.

Only facts confirmed in this specification may be represented in structured data.

## 9. Content and Data Architecture

Company facts, certification facts, and rounded machine metrics should live in a reusable typed data structure rather than being copied independently into homepage and About page JSX.

The homepage section, About page, metadata, and structured data should consume the same relevant source fields wherever practical. The existing unified SEO registry remains the sole source for page metadata and H1 values.

No existing URLs will be renamed or redirected.

## 10. Validation Requirements

Implementation must begin with failing regression tests and then satisfy:

- `/about` is present exactly once in the unified public-page registry.
- The page has a non-empty unique primary keyword.
- The final title starts with the primary keyword and is no longer than 70 characters.
- The brand appears no more than once in the title.
- The final meta description is unique, 160–300 characters, and contains the complete primary keyword.
- The final rendered About page has exactly one `h1`.
- The `h1` contains the complete primary keyword.
- The homepage still has exactly one `h1`.
- Every rendered image has an `alt` attribute.
- `/about` has one correct HTTPS canonical and appears in the sitemap.
- Neither page has an unintended `noindex`.
- Metadata, canonical, H1, certificate wording, and company relationship appear in server-rendered or static production HTML where applicable.
- The private source photograph and supplied PDF are not copied into public assets or referenced by public HTML.
- No unsupported `50+` equipment claim appears.
- No page states or implies that every product or shipment is GRS certified.

Run the existing lint, TypeScript, test, production-build, and production-HTML audit commands. The public-page audit total should increase from 28 to 29 pages.

## 11. Delivery Scope

The implementation will include:

- homepage certificate section;
- `/about` page;
- reusable company/certification/capability data;
- unified SEO registry entry;
- internal navigation and footer links;
- appropriate structured data;
- sitemap and machine-readable discovery coverage through existing generators;
- regression and final-render validation;
- a final list of changed files and verified results.

The implementation will not include:

- public machine inventory photography;
- public certificate scans or PDF downloads;
- a separate certifications route;
- invented production-volume claims;
- URL migrations or redirects;
- unrelated redesign work.
