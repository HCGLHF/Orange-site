"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Plus, Search, SlidersHorizontal } from "lucide-react";
import type { Fabric } from "@/lib/data";
import { fabricCollections, filterCollectionFabrics, formatFabricMeasurement, getFabricCollectionId, type FabricCollectionId } from "@/lib/fabric-collections";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { useInquiry } from "@/components/InquiryProvider";
import { RequestQuoteButton } from "@/components/RequestQuoteButton";
import { ArticleDialog } from "./ArticleDialog";
import { CollectionUrlState } from "./CollectionUrlState";
import { useCollectionMotion } from "./useCollectionMotion";

type Filters = {
  collection: FabricCollectionId | "all";
  query: string;
  series: string;
  material: string;
  weight: "all" | "under-250" | "250-350" | "over-350";
  page: number;
};
const initialFilters: Filters = { collection: "all", query: "", series: "all", material: "all", weight: "all", page: 1 };
const materials = ["wool", "cashmere", "cotton", "lyocell", "acetate", "elastane"];
const weights = ["under-250", "250-350", "over-350"];
const pageSize = 8;

function readFilters(query: string): Filters {
  const params = new URLSearchParams(query);
  const collection = params.get("collection");
  const material = params.get("material") || "all";
  const weight = params.get("weight") || "all";
  const requestedPage = Number(params.get("page"));
  return {
    collection: fabricCollections.some((item) => item.id === collection) ? collection as FabricCollectionId : "all",
    query: (params.get("q") || "").slice(0, 200),
    series: params.get("series") || "all",
    material: materials.includes(material) ? material : "all",
    weight: weights.includes(weight) ? weight as Filters["weight"] : "all",
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  };
}

function Metric({ fabric, field }: { fabric: Fabric; field: "weight" | "width" }) {
  const label = formatFabricMeasurement(fabric, field);
  const match = label.match(/^([\d.]+(?:\s*[-–]\s*[\d.]+)?)\s*(GSM|cm)$/i);
  return <p className={`article-${field}`}><span className="mobile-spec-label">{field === "weight" ? "Weight" : "Width"}</span>{match ? <>{match[1]}<small>{match[2]}</small></> : <small>{label}</small>}</p>;
}

export function FabricCollections({ fabrics, fontClassName, sourcingLinks, sourcingContent }: {
  fabrics: Fabric[];
  fontClassName: string;
  sourcingLinks: { href: string; label: string }[];
  sourcingContent?: ReactNode;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMounted, setFilterMounted] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Fabric | null>(null);
  const [feedback, setFeedback] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const filterPanel = useRef<HTMLDivElement>(null);
  const filterVersion = useRef(0);
  const transition = useRef("");
  const initialized = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();
  const { isSelected, addItem, removeItem, totalCount } = useInquiryCart();
  const { openInquiry } = useInquiry();
  const animate = useCollectionMotion();
  const collection = fabricCollections.find((item) => item.id === filters.collection);
  const availableSeries = useMemo(() => Array.from(new Set(fabrics.filter((fabric) => filters.collection === "all" || getFabricCollectionId(fabric) === filters.collection).map((fabric) => fabric.series).filter((series): series is string => !!series))), [fabrics, filters.collection]);
  const normalizedFilters = { ...filters, series: availableSeries.includes(filters.series) ? filters.series : "all" };
  const matches = filterCollectionFabrics(fabrics, normalizedFilters);
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(filters.page, pageCount);
  const visible = matches.slice((page - 1) * pageSize, page * pageSize);
  const filterCount = [normalizedFilters.series, filters.material, filters.weight].filter((value) => value !== "all").length;
  const stateKey = JSON.stringify(filters);

  const readLocation = useCallback((query: string) => {
    const next = readFilters(query);
    setFilters((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
  }, []);

  const update = (patch: Partial<Filters>, kind = "filter", push = false) => {
    const next = { ...normalizedFilters, ...patch };
    transition.current = kind;
    setFilters(next);
    const url = new URL(window.location.href);
    for (const key of ["collection", "q", "series", "material", "weight", "page"]) url.searchParams.delete(key);
    if (next.collection !== "all") url.searchParams.set("collection", next.collection);
    if (next.query) url.searchParams.set("q", next.query);
    for (const key of ["series", "material", "weight"] as const) if (next[key] !== "all") url.searchParams.set(key, next[key]);
    if (next.page > 1) url.searchParams.set("page", String(next.page));
    window.history[push ? "pushState" : "replaceState"](null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const selectCollection = (id: Filters["collection"], focus = false) => {
    update({ ...initialFilters, collection: id }, "collection", true);
    if (focus) requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      root.current?.querySelector("#catalogue")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  };

  useEffect(() => {
    const container = tabs.current;
    const line = indicator.current;
    if (!container || !line) return;
    const sync = (motion = false) => {
      const active = container.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!active) return;
      const before = getComputedStyle(line).transform;
      const next = `translate(${active.offsetLeft}px, ${active.offsetTop + active.offsetHeight - 1}px) scaleX(${active.offsetWidth})`;
      line.getAnimations?.().forEach((animation) => animation.cancel());
      line.style.transform = next;
      if (motion) animate(line, [{ transform: before }, { transform: next }], 320);
    };
    sync(initialized.current);
    initialized.current = true;
    const observer = new ResizeObserver(() => sync());
    observer.observe(container);
    let active = true;
    document.fonts.ready.then(() => { if (active) sync(); });
    return () => { active = false; observer.disconnect(); };
  }, [filters.collection, animate]);

  useEffect(() => {
    if (!transition.current) return;
    root.current?.querySelectorAll(".article-row").forEach((row, index) => {
      row.getAnimations?.().forEach((animation) => animation.cancel());
      animate(row, [{ opacity: .35, transform: "translateY(7px)" }, { opacity: 1, transform: "none" }], 280, Math.min(index * 20, 100));
    });
    if (transition.current === "collection") animate(heading.current, [{ opacity: .55, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }]);
    transition.current = "";
  }, [stateKey, animate]);

  useEffect(() => {
    root.current?.querySelectorAll(".intro-main, .intro-aside, .collection-entry").forEach((element, index) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) animate(element, [{ opacity: .25, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], 480, index * 45);
    });
    return () => clearTimeout(feedbackTimer.current);
  }, [animate]);

  useEffect(() => {
    const panel = filterPanel.current;
    if (panel) panel.inert = !filterOpen;
    if (filterMounted && filterOpen && panel) animate(panel, [{ opacity: 0, transform: "translateY(-5px)" }, { opacity: 1, transform: "none" }], 220);
  }, [filterOpen, filterMounted, animate]);

  const toggleFilters = async () => {
    const open = !filterOpen;
    const version = ++filterVersion.current;
    setFilterOpen(open);
    filterPanel.current?.getAnimations?.().forEach((animation) => animation.cancel());
    if (open) setFilterMounted(true);
    else {
      await animate(filterPanel.current, [{ opacity: 1 }, { opacity: 0 }], 130);
      if (version === filterVersion.current) setFilterMounted(false);
    }
  };

  const toggleSample = (fabric: Fabric, button: HTMLButtonElement) => {
    const selected = isSelected(fabric.id);
    if (selected) removeItem(fabric.id); else addItem(fabric);
    animate(button, [{ transform: "scale(.96)" }, { transform: "none" }], 220);
    setFeedback(`${fabric.articleNumber} ${selected ? "removed from" : "added to"} sample selection`);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 3500);
  };

  return <div ref={root} className={`fabric-collections ${fontClassName}`}>
    <Suspense fallback={null}><CollectionUrlState onChange={readLocation} /></Suspense>
    <section className="collection-intro page-width" id="collections-top" aria-labelledby="intro-title">
      <div className="intro-main"><p className="eyebrow">O&apos;RANGE FABRIC COLLECTIONS</p><h1 id="intro-title">Finished knit fabrics.<br /><span>A considered collection.</span></h1></div>
      <div className="intro-aside"><p>Start with the fabric character.<br />Find the specification that fits.</p><p className="intro-description">Three focused collections, from air-layer structures to wool blends and expressive surfaces.</p><a className="text-link" href="/fabrics#catalogue" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); selectCollection("all", true); }}>View all fabrics <ArrowUpRight className="icon" aria-hidden /></a></div>
    </section>
    <section className="collections-section page-width" aria-label="Choose a fabric collection">
      <div className="collection-grid">
        {fabricCollections.map((item) => <a key={item.id} className="collection-entry" href={`/fabrics?collection=${item.id}#catalogue`} aria-current={filters.collection === item.id ? "true" : undefined}
          onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); selectCollection(item.id, true); }}>
          <div className="collection-image"><Image src={item.image} alt={`Illustrative material study for ${item.name}`} width={1672} height={940} sizes="(max-width: 560px) 100vw, 33vw" priority={item.id === "structured"} /><span className="collection-number">{item.number}</span></div>
          <div className="collection-title-line"><h2>{item.title}</h2><span className="collection-arrow"><ArrowUpRight className="icon" aria-hidden /></span></div>
          <div className="collection-meta"><span>{item.character}</span><span className="dot" aria-hidden /><span>{item.count} articles</span></div>
        </a>)}
      </div>
      <div className="collection-footnote"><span>11 specialist series, organised into three collections.</span><span>Collection imagery is illustrative.</span></div>
    </section>
    <section className="catalogue-section" id="catalogue" aria-labelledby="catalogue-title">
      <div className="page-width">
        <div className="catalogue-heading"><div><p className="section-label">{collection ? `Collection ${collection.number}` : "The article index"}</p><h2 id="catalogue-title" tabIndex={-1} ref={heading}>{collection ? `${collection.shortName}.` : "Explore the fabrics."}</h2></div><p>{collection?.shortDescription || "Compare the details. Add relevant articles to your sample selection."}</p></div>
        <div className="collection-tabs has-indicator" aria-label="Filter by collection" ref={tabs}>
          {[{ id: "all" as const, shortName: "All fabrics", count: fabrics.length }, ...fabricCollections].map((item) => <button key={item.id} type="button" className="collection-tab" aria-pressed={filters.collection === item.id} onClick={() => selectCollection(item.id)}>{item.shortName} <span>{item.count}</span></button>)}
          <span ref={indicator} className="tab-indicator" aria-hidden />
        </div>
        <div className="catalogue-toolbar"><label className="search-field"><Search className="icon" aria-hidden /><span className="sr-only">Search articles, series or composition</span><input type="search" placeholder="Search article, series or composition" autoComplete="off" maxLength={200} value={filters.query} onChange={(event) => update({ query: event.target.value, page: 1 }, "")} /></label><div className="toolbar-end"><span id="result-count" role="status">{matches.length} articles</span><button type="button" className="filter-toggle" aria-expanded={filterOpen} aria-controls="collection-filter-panel" onClick={() => void toggleFilters()}><SlidersHorizontal className="icon" aria-hidden /> Filters {filterCount > 0 && <span>({filterCount})</span>}</button></div></div>
        {filterMounted && <div ref={filterPanel} id="collection-filter-panel" className="filter-panel" aria-hidden={!filterOpen}>
          <label>Series<select value={normalizedFilters.series} onChange={(event) => update({ series: event.target.value, page: 1 })}><option value="all">All series</option>{availableSeries.map((series) => <option key={series}>{series}</option>)}</select></label>
          <label>Composition<select value={filters.material} onChange={(event) => update({ material: event.target.value, page: 1 })}><option value="all">All compositions</option>{materials.map((material) => <option key={material} value={material}>Contains {material}</option>)}</select></label>
          <label>Fabric weight<select value={filters.weight} onChange={(event) => update({ weight: event.target.value as Filters["weight"], page: 1 })}><option value="all">All weights</option><option value="under-250">Under 250 GSM</option><option value="250-350">250–350 GSM</option><option value="over-350">Over 350 GSM</option></select></label>
          <button type="button" className="reset-filters" onClick={() => update({ series: "all", material: "all", weight: "all", page: 1 })}>Reset filters</button>
        </div>}
        <div className="article-table"><div className="article-table-head" aria-hidden><span>Article / Series</span><span>Composition</span><span>Weight</span><span>Width</span><span>Selection</span></div><div className="article-list">
          {visible.map((fabric) => {
            const selected = isSelected(fabric.id);
            const group = fabricCollections.find((item) => item.id === getFabricCollectionId(fabric));
            return <article key={fabric.id} className="article-row" aria-label={`Article ${fabric.articleNumber}`} data-selected={selected}>
              <div className="article-identity"><span className="article-mark" aria-hidden>{group?.number}</span><div><button type="button" className="article-code" onClick={() => setActiveArticle(fabric)} aria-haspopup="dialog">{fabric.articleNumber}<span className="detail-arrow"><ArrowUpRight className="icon" aria-hidden /></span></button><p className="article-series">{fabric.series}</p></div></div>
              <p className="article-composition">{fabric.composition}</p><Metric fabric={fabric} field="weight" /><Metric fabric={fabric} field="width" />
              <button type="button" className="add-sample" aria-pressed={selected} aria-label={`${selected ? "Remove" : "Add"} ${fabric.articleNumber} ${selected ? "from" : "to"} sample selection`} onClick={(event) => toggleSample(fabric, event.currentTarget)}>{selected ? <Check className="icon" aria-hidden /> : <Plus className="icon" aria-hidden />}{selected ? "Added" : "Select"}</button>
            </article>;
          })}
        </div></div>
        {matches.length === 0 && <div className="empty-state"><h3>No articles match these details.</h3><p>Try another article number or broaden your filters.</p><button type="button" className="button-secondary" onClick={() => update({ ...initialFilters, collection: filters.collection })}>Clear search &amp; filters</button></div>}
        <div className="list-footer"><p>Showing {matches.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, matches.length)} of {matches.length} articles</p><div className="pagination"><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => update({ page: page - 1 }, "page")}><ArrowLeft className="icon" aria-hidden /></button><span>{page} / {pageCount}</span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => update({ page: page + 1 }, "page")}><ArrowRight className="icon" aria-hidden /></button></div></div>
        <p className="specification-note">Specifications are catalogue references. Confirm the current sample, colour, quantity and availability with your inquiry.</p>
        <div className="selection-summary"><span role="status">{feedback || (totalCount ? `${totalCount} ${totalCount === 1 ? "article" : "articles"} in your sample selection` : "Shortlist the articles you would like to discuss.")}</span><RequestQuoteButton className="button-secondary">{totalCount ? `Review selection (${totalCount})` : "Request a sample"}<ArrowUpRight className="icon" aria-hidden /></RequestQuoteButton></div>
      </div>
    </section>
    <section className="development-section page-width" id="development" aria-labelledby="development-title"><div><p className="section-label">Custom development</p><h2 id="development-title">Have a different<br />fabric in mind?</h2></div><div className="development-content"><p>A reference sample, a garment brief or a particular hand feel. Start with what you have, and outline the fabric you need.</p><button type="button" className="button-primary" onClick={() => openInquiry()}>Build a fabric brief <ArrowUpRight className="icon" aria-hidden /></button><Link href="/custom-knit-fabric-development" className="development-link">Explore custom development <ArrowUpRight className="icon" aria-hidden /></Link></div></section>
    <section className="sourcing-section page-width" aria-labelledby="sourcing-title"><h2 id="sourcing-title">A clear path to your next sample.</h2><div className="sourcing-steps"><div><span>01</span><h3>Find your direction</h3><p>Choose a collection and compare article specifications.</p></div><div><span>02</span><h3>Build your selection</h3><p>Shortlist the articles that fit your development brief.</p></div><div><span>03</span><h3>Confirm the details</h3><p>Discuss the sample, colour, quantity and testing requirements.</p></div></div>
      <details className="sourcing-references"><summary>Fabric construction &amp; sourcing references</summary><p>Explore construction guidance, manufacturing capabilities and sample approval before confirming an article. Availability, colour and commercial terms are confirmed with your inquiry.</p><div>{sourcingLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowUpRight className="icon" aria-hidden /></Link>)}</div>{sourcingContent}</details>
    </section>
    <ArticleDialog fabric={activeArticle} onClose={() => setActiveArticle(null)} />
  </div>;
}
