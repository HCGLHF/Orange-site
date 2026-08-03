export const TRACKABLE_PUBLIC_PATHS = [
  "/",
  "/about",
  "/fabrics",
  "/ready-stock-knit-fabrics",
  "/finished-double-knit-fabrics",
  "/custom-knit-fabric-development",
  "/fabrics/cotton-jersey",
  "/fabrics/cotton-spandex-jersey",
  "/fabrics/fleece-french-terry",
  "/fabrics/scuba-air-layer",
  "/fabrics/interlock-fabric",
  "/fabrics/ponte-roma-fabric",
  "/fabrics/scuba-air-layer-fabric",
  "/fabrics/jacquard-knit-fabric",
  "/fabrics/wool-blend-knit-fabric",
  "/fabrics/rib-knit-fabric",
  "/blog",
  "/blog/what-is-double-knit-fabric",
  "/blog/what-is-interlock-fabric",
  "/blog/what-is-ponte-fabric",
  "/blog/what-is-scuba-knit-fabric",
  "/blog/what-is-rib-knit-fabric",
  "/blog/jacquard-knit-vs-woven-jacquard",
  "/blog/air-layer-knit-fabric-sourcing-guide",
  "/blog/how-to-source-wool-blend-knit-fabric",
  "/blog/jacquard-knit-fabric-weight-and-width-guide",
  "/blog/brushed-and-pile-knit-fabric-finishes",
  "/blog/how-to-write-a-knit-fabric-rfq",
  "/blog/knit-fabric-sourcing-questions",
  "/blog/french-terry-fabric-vs-fleece",
  "/blog/french-terry-fabric-for-hoodies",
  "/blog/heavyweight-french-terry-fabric",
  "/blog/interlock-vs-jersey-fabric",
] as const;

const trackablePublicPathSet: ReadonlySet<string> = new Set(TRACKABLE_PUBLIC_PATHS);

export function isTrackablePublicPath(path: string): boolean {
  return trackablePublicPathSet.has(path);
}
