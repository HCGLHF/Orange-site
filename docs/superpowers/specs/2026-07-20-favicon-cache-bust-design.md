# Favicon Cache-Bust Design

## Goal

Restore the branded orange page-tab icon for visitors after the latest production merge, without changing its approved appearance.

## Evidence and root cause

- `app/icon.svg` on `main` is byte-for-byte the same branded orange-and-leaf SVG as commit `a5490d9`.
- Production currently serves that file successfully and emits it as `/icon.svg?636e5a089117779b`.
- Because the asset content did not change across the merge, its generated URL hash also did not change. Browsers that cached an older/default tab icon may therefore keep displaying it.

## Selected approach

Add a harmless version marker to the root `<svg>` element while preserving every visible shape, colour, coordinate, and dimension. The changed file content will make Next.js emit a new fingerprinted favicon URL, forcing browsers to request the branded icon again.

No PNG or ICO fallback will be added. Next.js already discovers `app/icon.svg`, and production returns it with the correct `image/svg+xml` content type.

## Files and behavior

- `app/icon.svg`: add one non-visual version attribute only.
- `tests/favicon.test.mjs`: assert the version marker so future merges cannot silently remove the cache-bust revision.

The favicon artwork remains visually identical: coral-orange fruit, green leaf, 32 by 32 view box.

## Verification

1. Add the regression assertion and confirm it fails against the current SVG.
2. Add the SVG version marker and confirm the favicon test passes.
3. Run the full project test suite and production build.
4. Commit and push to `main`.
5. Wait for Vercel production status `READY` with no build errors.
6. Confirm `orangetextiles.com` emits a new favicon query hash and the served SVG contains the branded artwork and version marker.

## Rollback

Revert the single implementation commit. The previous SVG remains valid, so rollback does not affect page availability.
