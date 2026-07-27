# About Us Cinematic Hero Design

## Status

Approved visual direction: option B, cinematic full-width hero.

## Goal

Turn the circular-knitting-machine image into the dominant About page background
hero. Display “About Us” over the image, then begin the company introduction in
a separate section below it.

## Scope

- Redesign only the top of the existing `/about` page.
- Reuse `/images/company/about-circular-knitting-floor.png`.
- Preserve the existing navigation, public route, structured data, metadata,
  analytics behavior, and remaining About page sections.
- Keep the factual image alt text and exclude all “illustrative” wording.

## Layout

### Hero

- Place the hero immediately below the global navigation.
- Make the image full-bleed across the viewport.
- Desktop height at the `lg` breakpoint and above:
  `clamp(34rem, 75svh, 49rem)`.
- Mobile and tablet height: `clamp(26rem, 58svh, 35rem)`.
- Use `next/image` with `fill`, responsive `sizes`, and `object-cover`.
- Keep the knitting machines around the visual centre when cropping.
- Add a uniform dark translucent overlay to protect title contrast.
- Centre the display title “About Us” horizontally and vertically.
- Do not add captions, qualifiers, location text, or other visible copy over the
  image.

### Introduction

- Start the company introduction immediately below the hero.
- Retain the existing company-profile eyebrow, registry-owned SEO H1, and
  introductory paragraph.
- Keep the Operating Model content beside the introduction on larger screens and
  below it on smaller screens.
- Use the existing brand cream, white, charcoal, and orange design tokens.

## Semantics and Data Collection

- “About Us” is display text in the visual hero.
- The registry-owned company title remains the page’s single semantic H1 in the
  introduction section.
- The image alt text remains:
  `Rows of circular knitting machines inside a modern knitting factory`.
- Do not add “illustrative” language to visible copy, alt text, metadata,
  structured data, or analytics attributes.
- Do not change routes, event names, tracking attributes, or page identifiers.

## Responsive Behaviour

- The hero remains full-width on every breakpoint.
- The mobile crop must keep identifiable rows of textile machinery visible.
- The introduction changes from two columns to one column without horizontal
  overflow.
- The title remains legible against the image at all supported sizes.

## Verification

- Add a failing regression test for the full-bleed hero structure before editing
  production code.
- Verify the targeted About test, full test suite, TypeScript, and lint.
- Inspect desktop and mobile previews in the in-app browser.
- Confirm no horizontal overflow, no console errors, and no visible or semantic
  “illustrative” wording.
- Update `design-qa.md`; P0, P1, and P2 findings must be resolved before handoff.

## Out of Scope

- Replacing the generated factory image with final verified photography.
- Changing content below the existing introduction.
- Deploying or publishing the page.
