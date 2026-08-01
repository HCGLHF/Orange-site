# Project Context

## Goal

Build and maintain O'range Textile's overseas-facing website so apparel buyers and AI answer engines can clearly understand the company, its fabric categories, sourcing capabilities, contact paths, and citation-ready facts.

## Users

- Overseas apparel buyers and sourcing teams.
- Private-label apparel brands evaluating premium finished knit and woven fabric suppliers.
- Search crawlers and AI retrieval systems that need stable, citable company and product information.
- Internal operators who handle inquiries and fabric sample requests.

## Core Business Concepts

- O'range Textile / Shaoxing Shicheng Textile Products Co., Ltd.
- Shaoxing Keqiao finished fabric sourcing, development, and manufacturing coordination.
- Premium finished knit and woven fabrics, including structured, stretch, medium-to-heavy, jacquard, brushed, wool-blend, cashmere-blend, jersey, rib, fleece, French terry, scuba, and air-layer directions.
- Buyer development briefs can start from an image, hand feel, reference sample, garment brief, functional requirement, or early product direction.
- Fabric samples, RFQs, overseas sourcing, apparel applications, and inquiry capture.
- GEO-ready entity facts, structured pages, sitemap, robots, and llms.txt.

## Current Non-Goals

- Do not build a Chinese domestic standalone site in this codebase.
- Do not make public product pages depend on Notion availability.
- Do not introduce large CMS, search, analytics, or ecommerce systems until they clearly reduce risk or unlock user value.
- Do not mix marketing pages, inquiry persistence, and catalog data access into a single all-purpose module.

## Constraints

- Public-facing site content and filenames should remain English-only.
- Public catalog content should be crawlable without client-only data fetching.
- Treat supplied knit and woven catalogues as approved sourcing evidence, not live-stock, colour, price, lead-time, certification, or performance guarantees.
- Preserve clear module boundaries between UI components, local catalog data, structured GEO content, and inquiry handling.
- Before code changes, read project memory files and ADRs, then identify the goal served, affected boundaries, relevant decisions, safer smaller implementation path, and whether a new ADR is needed.
