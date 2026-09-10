import type { Fabric } from "@/lib/data";
import { publicFabrics } from "./public-catalog.ts";

export type FabricCollectionId = "structured" | "soft-touch" | "textured";
export type FabricCollectionWeight = "all" | "under-250" | "250-350" | "over-350";

export type FabricCollectionFilters = {
  collection?: FabricCollectionId | "all";
  query?: string;
  series?: string;
  material?: string;
  weight?: FabricCollectionWeight;
};

type FabricCollection = {
  id: FabricCollectionId;
  number: string;
  name: string;
  title: string;
  shortName: string;
  description: string;
  shortDescription: string;
  character: string;
  image: string;
  series: readonly string[];
};

// These groups describe documented article families, not stock or performance guarantees.
const collectionDefinitions: readonly FabricCollection[] = [
  {
    id: "structured",
    number: "01",
    name: "Air-Layer & Structured Knits",
    title: "Air-layer & structured knits",
    shortName: "Air-layer & structured",
    description: "Air-layer, yarn-dyed wool-blend air-layer and structured polyester-viscose articles. Documented weights range from 210 to 510 GSM, with compositions and usable widths listed by article.",
    shortDescription: "Air-layer and structured polyester-viscose articles, including yarn-dyed wool blends.",
    character: "Structure & shape",
    image: "/images/finished-fabrics/air-layer-material-study.webp",
    series: ["Air-layer", "Yarn-dyed wool-blend air-layer", "Structured polyester-viscose"],
  },
  {
    id: "soft-touch",
    number: "02",
    name: "Soft-Touch & Wool-Blend Knits",
    title: "Soft-touch & wool-blend knits",
    shortName: "Soft-touch & wool-blend",
    description: "Faux-cashmere, acrylic-wool, cashmere-blend and lyocell-acetate-wool composite articles. Documented weights range from 220 to 420 GSM; fibre compositions vary by article.",
    shortDescription: "Explore faux-cashmere, wool and cashmere blends, and lyocell-acetate-wool composites.",
    character: "Blends & handle",
    image: "/images/finished-fabrics/wool-blend-material-study.webp",
    series: ["Faux-cashmere", "Acrylic-wool", "Cashmere blend", "Lyocell-acetate-wool composite"],
  },
  {
    id: "textured",
    number: "03",
    name: "Textured & Brushed Knits",
    title: "Textured & brushed knits",
    shortName: "Textured & brushed",
    description: "Acetate-brushed, lyocell-acetate-wool texture, raised-pile and wool-blend jacquard articles. Documented weights range from 200 to 280 GSM across these four surface families.",
    shortDescription: "Jacquard, brushed, raised-pile and textured articles with distinct surface character.",
    character: "Surface & texture",
    image: "/images/finished-fabrics/brushed-pile-knit-finishes.webp",
    series: ["Acetate brushed", "Lyocell-acetate-wool texture", "Raised-pile", "Wool-blend jacquard"],
  },
];

const collectionBySeries = new Map<string, FabricCollectionId>(
  collectionDefinitions.flatMap((collection) =>
    collection.series.map((series) => [series, collection.id] as const)
  )
);

export function getFabricCollectionId(
  fabric: Pick<Fabric, "series">
): FabricCollectionId | null {
  return collectionBySeries.get(fabric.series ?? "") ?? null;
}

export const fabricCollections = collectionDefinitions.map((collection) => ({
  ...collection,
  count: publicFabrics.filter((fabric) => getFabricCollectionId(fabric) === collection.id).length,
}));

export function formatFabricMeasurement(
  fabric: Fabric,
  key: "weight" | "width"
): string {
  const label = key === "weight" ? fabric.weightLabel : fabric.widthLabel;
  return label || (fabric[key] > 0
    ? `${fabric[key]} ${key === "weight" ? "GSM" : "cm"}`
    : "To be confirmed");
}

export function filterCollectionFabrics(
  fabrics: readonly Fabric[],
  {
    collection = "all",
    query = "",
    series = "all",
    material = "all",
    weight = "all",
  }: FabricCollectionFilters = {}
): Fabric[] {
  const search = query.trim().toLowerCase();
  const fibre = material.toLowerCase();
  const matches = fabrics.filter((fabric) => {
    if (collection !== "all" && getFabricCollectionId(fabric) !== collection) return false;
    if (series !== "all" && fabric.series !== series) return false;
    if (search && !`${fabric.articleNumber ?? ""} ${fabric.series ?? ""} ${fabric.composition}`.toLowerCase().includes(search)) return false;
    if (fibre !== "all" && !fabric.composition.toLowerCase().includes(fibre)) return false;
    // Source numeric weights are the documented minimum for ranged measurements.
    if (weight !== "all" && !(fabric.weight > 0)) return false;
    if (weight === "under-250" && fabric.weight >= 250) return false;
    if (weight === "250-350" && (fabric.weight < 250 || fabric.weight > 350)) return false;
    if (weight === "over-350" && fabric.weight <= 350) return false;
    return true;
  });

  const seen = new Set<string | undefined>();
  const first: Fabric[] = [];
  const remaining: Fabric[] = [];
  for (const fabric of matches) {
    if (seen.has(fabric.series)) remaining.push(fabric);
    else {
      first.push(fabric);
      seen.add(fabric.series);
    }
  }
  return [...first, ...remaining];
}
