# Hero final performance remediation design

## Status

Approved by the user on 2026-08-18 with authorization to deploy directly to production only after the five-run acceptance matrix passes.

## Objective

Close the two remaining strict performance gaps without broadening scope:

1. Keep the mobile Home and About LCP image transfer medians at or below 25,600 bytes.
2. Reduce Ready Stock mobile LCP median to at most 2,300 ms, with no score, TBT, CLS, media, analytics, or route-prefetch regression.

## Selected design

### Mobile-specific Hero delivery

Promote the already reviewed 750-pixel AVIF q55 renditions for Home, About, and Ready Stock into `public/images`. The measured file sizes are 21,032, 24,805, and 13,388 bytes respectively.

Use one shared server component around `next/image`'s `getImageProps`:

- mobile `<source>`: static AVIF, selected only at `max-width: 767px`;
- desktop fallback: the existing Next optimized source set at quality 35;
- mobile preload: `type=image/avif` and `media=(max-width: 767px)`;
- desktop preload: the generated Next image source set and `media=(min-width: 768px)`;
- both rendered image paths retain high fetch priority, full-bleed fill styling, alt text, and `sizes=100vw`.

The two media-qualified preloads prevent the browser from preloading the desktop fallback on mobile. Unsupported AVIF clients fall through to the existing Next image path.

### Ready Stock render delay

Set `decoding="sync"` only for the Ready Stock Hero. Home and About keep asynchronous decoding. The change is intentionally isolated because Ready Stock's existing median transfer size and TTFB already pass, while its element render delay is the remaining dominant subpart.

## Rejected alternatives

- Global Next AVIF configuration: rejected because prior local cold encoding was 2.6–3.2 times slower and affects every image route.
- Further WebP quality reduction: rejected because q22 still missed the byte ceiling for Home and About.
- `<picture>` around a priority `<Image>`: rejected because Next would preload the fallback and mobile would fetch both candidates.
- Selecting the fastest prior Ready Stock run: rejected; all five cold runs remain part of the decision.

## Tests and evidence

TDD contracts will require:

- all three mobile AVIF files exist, are valid AVIF, and are no larger than 25,600 bytes;
- Home and Ready Stock records identify their mobile rendition;
- About uses its mobile rendition;
- the shared component emits mutually exclusive mobile/desktop preloads and one `<picture>` fallback;
- Ready Stock alone requests synchronous decoding;
- existing no-video, no-prefetch, deferred analytics, and lazy JavaScript contracts remain green.

Runtime verification will record, for Home/About/Ready Stock:

- mobile requests exactly one mobile Hero candidate and no desktop Hero candidate;
- desktop requests exactly one desktop Hero candidate and no mobile AVIF;
- precise LCP node and resource URL;
- five fresh AB/BA production-versus-preview mobile Lighthouse pairs.

## Deployment gate

Deploy or promote to production only if all conditions pass:

- Home and About preview median LCP transfer bytes are each at most 25,600;
- Ready Stock preview median LCP is at most 2,300 ms;
- Ready Stock median element render delay is at most 700 ms;
- all three pages have median score at least 80, TBT at most 200 ms, and CLS at most 0.1;
- every LHR has an exact LCP node;
- no pre-LCP Media, GA4/GTM/chat/heatmap, or `_rsc` request appears;
- no duplicate Hero candidate is downloaded;
- local tests, typecheck, production build, and browser tests pass.

If any condition fails, stop at preview and do not deploy production.
