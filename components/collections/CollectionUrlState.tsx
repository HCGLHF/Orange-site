"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Isolate query subscriptions so the catalogue itself stays in the static HTML. */
export function CollectionUrlState({ onChange }: { onChange: (query: string) => void }) {
  const params = useSearchParams();
  const query = params.toString();
  useEffect(() => onChange(query), [query, onChange]);
  return null;
}
