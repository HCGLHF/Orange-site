export type StockFilter = "all" | "in-stock" | "preorder" | "out-of-stock";

const supportedStockFilters = new Set<StockFilter>([
  "all",
  "in-stock",
  "preorder",
  "out-of-stock",
]);

export function resolveStockFilter(
  raw: string | null,
  fallback: StockFilter = "all"
): StockFilter {
  if (!raw || !supportedStockFilters.has(raw as StockFilter)) {
    return fallback;
  }

  return raw as StockFilter;
}
