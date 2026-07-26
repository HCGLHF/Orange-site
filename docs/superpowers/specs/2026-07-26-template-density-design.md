# Orange Template Density Design

Date: 2026-07-26

## Problem

The 2026-07-26 Semrush crawl reports 29 low text/HTML pages. The prior
catalogue-grounded evidence experiment did not clear the warning. Production
HTML measurement shows a representative buyer guide at about 97 KB with a
text/HTML ratio of 0.0797. The marked global navigation alone contributes about
11.5 KB, including 7.5 KB of repeated Tailwind class attributes.

## Goal

Raise the measured production text/HTML ratio for the buyer-guide page family
to at least 0.10 without changing visible navigation, page layout, content,
links, accessibility behavior, metadata, schema or inquiry flows.

## Design

1. Add a production HTML density inspector that:
   - removes scripts and styles only when extracting visible text;
   - measures visible text characters against raw HTML characters;
   - measures the marked global navigation byte footprint;
   - reports every public page and fails when the protected buyer-guide cohort
     stays below the agreed threshold.
2. Move long repeated Tailwind utility strings from the global navigation,
   footer and shared finished-fabric page template into short component class
   names defined in `app/globals.css`.
3. Preserve the existing DOM structure, all server-rendered navigation links,
   `aria-*` contracts and interactive state classes.
4. Do not hide navigation links, remove evidence content, change URLs or add
   generic body copy.

## Acceptance

- Protected buyer-guide production HTML ratio is at least 0.10.
- Marked global navigation HTML is materially smaller than the current
  11.5 KB baseline.
- All existing navigation, SEO and content tests pass.
- Production SEO audit passes every registered public page.
- Desktop and mobile browser checks show no visual or interaction regression.

## Risk Control

The change only relocates styling declarations from repeated HTML attributes
into the compiled stylesheet. If a visual mismatch appears, restore the
corresponding utility set in the component class rather than changing layout
or navigation behavior.
