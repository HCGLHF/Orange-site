# About Cinematic Hero Design QA

## Source visual truth

- Approved concept: option B, “电影感大画幅”.
- Source mock:
  `D:\GEO-ALPHA\orange-textile\orange-site\.superpowers\brainstorm\aboutus-hero-20260728\content\hero-layout-options.html`
- Source capture:
  `tmp/about-cinematic-preview/about-cinematic-source.png`
- Source capture pixels: 1265 × 712.
- Supporting specification:
  `docs/superpowers/specs/2026-07-28-about-cinematic-hero-design.md`.

## Rendered implementation

- Route: `http://127.0.0.1:3001/about`
- Desktop capture:
  `tmp/about-cinematic-preview/about-cinematic-desktop.png`
- Desktop browser viewport override: 1440 × 900 CSS px.
- Desktop rendered content width: 1425 CSS px.
- Desktop capture pixels: 1425 × 891 at browser density 1.
- Mobile capture:
  `tmp/about-cinematic-preview/about-cinematic-mobile.png`
- Mobile browser viewport override: 390 × 844 CSS px.
- Mobile rendered content width: 375 CSS px.
- Mobile capture pixels: 375 × 811 at browser density 1.
- Combined comparison:
  `tmp/about-cinematic-preview/about-cinematic-comparison.png`
  (1440 × 450; both desktop captures normalized to 720 × 450).
- State: initial `/about` page load, no menus or dialogs open.

## Full-view comparison evidence

The approved option B is the centre card in the source capture. The combined
comparison places the complete source board on the left and the desktop
implementation on the right. Both show the same factory image used as a
full-width, darkened Hero with a large centred “About Us” display title and the
company introduction starting below the image.

The implementation uses the approved desktop proportion: the Hero measures
675 px high at the 900 px browser viewport override, which is exactly 75% of
that viewport before clamping. The full-width crop keeps multiple rows of
circular knitting machines visible.

## Focused comparison evidence

No separate focused crop was required. The Hero, title, image crop, orange
divider treatment, and start of the company introduction are all large and
readable in the normalized side-by-side comparison. Mobile was evaluated
separately because it represents a responsive state rather than a same-viewport
fidelity target.

## Required fidelity surfaces

- Fonts and typography: the implementation keeps the site’s existing sans-serif
  family and weights. “About Us” is centred, high-contrast, and does not wrap at
  desktop or mobile widths. The registry-owned company H1 retains the established
  brand hierarchy below the Hero.
- Spacing and layout rhythm: the desktop Hero matches the selected 75svh
  direction. The introduction begins immediately below it. On mobile, the Hero
  resolves to 489.5 px high and the introduction begins at 553.5 px after the
  64 px navigation row.
- Colors and visual tokens: the implementation retains the approved dark,
  uniform image overlay, white display title, cream Operating Model card, orange
  rule, and existing charcoal type.
- Image quality and asset fidelity: the selected 1672 × 941 factory image renders
  through `next/image`, covers the full Hero, remains sharp, and retains
  identifiable textile machines in both crops.
- Copy and content: the only Hero copy is “About Us”. The visible and semantic
  page content contains no “illustrative” language. Existing company copy,
  location, and Operating Model content remain below the image.

## Responsive and technical checks

- Desktop: `scrollWidth` 1425 equals `clientWidth` 1425.
- Mobile: `scrollWidth` 375 equals `clientWidth` 375.
- Mobile title bounds remain inside the viewport and do not clip.
- Image alt:
  `Rows of circular knitting machines inside a modern knitting factory`.
- H1 count: 1.
- Browser console errors: 0.
- Browser console warnings: 0.

## Findings

- P0: none.
- P1: none.
- P2: none.

## Comparison history

- Pass 1: no actionable P0, P1, or P2 differences were found, so no visual fix
  iteration was required.

## Follow-up polish

- P3: replace the generated factory visual with verified photography when final
  factory photography becomes available, while preserving the approved crop and
  Hero proportions.

final result: passed
