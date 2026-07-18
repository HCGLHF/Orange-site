# O'range Textile Favicon Design

## Goal

Replace the default Next.js/Vercel browser-tab icon with the existing O'range Textile orange mark, while leaving the in-page brand mark unchanged.

## Existing Sources

- The canonical brand artwork is the inline SVG in `components/OrangeMark.tsx`.
- The page-level brand button uses that artwork through `components/SiteBrand.tsx`.
- The default browser icon is currently supplied by `app/favicon.ico`.

## Chosen Design

Create `app/icon.svg` from the same paths, colors, and `32 32` view box used by `OrangeMark`. Remove `app/favicon.ico` so browsers cannot continue selecting the default icon. Next.js App Router will discover `app/icon.svg` as file-based icon metadata and emit its favicon link automatically.

No header, layout, typography, or brand-color changes are included.

## Verification

- Confirm the old `app/favicon.ico` is absent and `app/icon.svg` contains the orange mark.
- Run the existing automated tests.
- Run a production build and confirm Next.js accepts the icon metadata.
- Inspect the generated page metadata or deployed site to confirm the favicon resolves to the new icon.

## Delivery

Commit only the design and favicon-related changes, push them to the GitHub repository, and allow the existing Vercel Git integration to deploy the update.
