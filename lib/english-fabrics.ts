import type { Fabric } from "@/lib/data";

const stockMap: Record<string, string> = {
  现货: "In stock",
  预定: "Preorder",
  预订: "Preorder",
  缺货: "Out of stock",
  缺貨: "Out of stock",
  停产: "Discontinued",
};

const tagMap: Record<string, string> = {
  "T恤首选": "T-shirt fabric",
  商务: "Business casual",
  童装: "Childrenswear",
  卫衣面料: "Hoodie fabric",
  秋冬外套: "Autumn / winter outerwear",
  现货: "In stock",
  预定: "Preorder",
  缺货: "Out of stock",
  基础款: "Basic fabric",
  透气: "Breathable",
  本白现货: "Natural white in stock",
  柔软弹力: "Soft stretch",
  挺括: "Structured",
  保暖: "Warm",
};

const knownFabricNames: Array<[string, string]> = [
  ["32S精梳棉氨纶", "32S combed cotton spandex jersey"],
  ["40S纯棉汗布", "40S pure cotton single jersey"],
  ["涤棉空气层", "Poly-cotton scuba air-layer knit"],
  ["精梳棉氨纶", "Combed cotton spandex jersey"],
  ["纯棉汗布", "Pure cotton single jersey"],
  ["空气层", "Air-layer knit"],
];

const phraseMap: Array<[string, string]> = [
  ["95%棉 5%氨纶", "95% cotton / 5% spandex"],
  ["100%精梳棉", "100% combed cotton"],
  ["65%涤纶 35%棉", "65% polyester / 35% cotton"],
  ["精梳棉", "combed cotton"],
  ["涤纶", "polyester"],
  ["氨纶", "spandex"],
  ["棉", "cotton"],
  ["手感像洗过的旧T恤，回弹好，适合做修身款", "Soft like a worn-in T-shirt, with good recovery for slim-fit styles."],
  ["轻薄透气，夏日白T的最佳选择", "Lightweight and breathable, suitable for summer white T-shirt programs."],
  ["空气层结构，挺括有型，做卫衣显质感", "Air-layer construction with structure and body for premium hoodie applications."],
  ["手感像洗过的旧", "Soft worn-in hand feel"],
  ["回弹好", "good recovery"],
  ["适合做修身款", "suitable for slim-fit styles"],
  ["轻薄透气", "lightweight and breathable"],
  ["夏日白", "summer white"],
  ["的最佳选择", "programs"],
  ["空气层结构", "air-layer construction"],
  ["挺括有型", "structured hand feel"],
  ["做卫衣显质感", "suitable for premium hoodies"],
  ["T恤", "T-shirt"],
  ["卫衣", "hoodie"],
];

function hasHan(value: string | undefined): boolean {
  return /[\u4e00-\u9fff]/.test(value ?? "");
}

function translateKnown(value: string, fallback: string): string {
  let next = value.trim();
  for (const [source, target] of phraseMap) {
    next = next.replaceAll(source, target);
  }
  return hasHan(next) ? fallback : next;
}

function translateFabricName(name: string, fallback: string): string {
  const match = knownFabricNames.find(([source]) => name.includes(source));
  if (match) return match[1];
  return translateKnown(name, fallback);
}

function translateList(values: string[] | undefined): string[] | undefined {
  if (!values || values.length === 0) return values;
  const translated = values.map((value) => {
    const trimmed = value.trim();
    return tagMap[trimmed] ?? translateKnown(trimmed, "Knit fabric");
  });
  return Array.from(new Set(translated.filter(Boolean)));
}

function translateStock(value: string | undefined): string | undefined {
  if (!value) return value;
  return stockMap[value.trim()] ?? translateKnown(value, "In stock");
}

export function toEnglishFabric(fabric: Fabric): Fabric {
  const name = translateFabricName(fabric.name, "Custom knit fabric");

  return {
    ...fabric,
    name,
    composition: translateKnown(fabric.composition, "Custom knit composition"),
    description: translateKnown(
      fabric.description,
      "Production-ready knitted fabric for overseas apparel sourcing."
    ),
    tags: translateList(fabric.tags) ?? [],
    scenarios: translateList(fabric.scenarios),
    stockStatus: translateStock(fabric.stockStatus),
  };
}

export function toEnglishFabrics(fabrics: Fabric[]): Fabric[] {
  return fabrics.map(toEnglishFabric);
}
