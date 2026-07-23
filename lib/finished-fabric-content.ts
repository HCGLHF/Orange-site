import rawPages from "@/content/finished-fabrics.json";

export type FinishedFabricLink = {
  href: string;
  label: string;
};

export type FinishedFabricSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  note?: {
    label: string;
    text: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
};

export type FinishedFabricPage = {
  kind: "hub" | "product" | "index" | "article";
  url: string;
  eyebrow: string;
  opening: string;
  hero: {
    src: string;
    alt: string;
    caption: string;
  };
  breadcrumbs: FinishedFabricLink[];
  product?: {
    name: string;
    category: string;
  };
  published?: string;
  updated?: string;
  reviewer?: string;
  sections: FinishedFabricSection[];
  faq: Array<{
    q: string;
    a: string;
  }>;
  relatedLinks: FinishedFabricLink[];
  evidenceBoundary: string;
};

const finishedFabricPages = rawPages as FinishedFabricPage[];

export function getFinishedFabricPages() {
  return finishedFabricPages;
}

export function getFinishedFabricPage(url: string) {
  return finishedFabricPages.find((page) => page.url === url);
}

export function getFinishedProductPages() {
  return finishedFabricPages.filter((page) => page.kind === "product");
}

export function getFinishedBlogArticles() {
  return finishedFabricPages.filter((page) => page.kind === "article");
}

export function getFinishedFabricSlug(url: string) {
  return url.split("/").filter(Boolean).at(-1) ?? "";
}
