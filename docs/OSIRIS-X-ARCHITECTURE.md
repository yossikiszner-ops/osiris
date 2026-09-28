# OSIRIS X — Trusted Public Intelligence Platform

This fork evolves OSIRIS into an independent bilingual (Hebrew/English) public-source intelligence and geospatial analysis platform.

## Product principles

1. **Evidence before presentation.** Every operational entity/event should carry source, observed time, ingestion time, freshness and provenance.
2. **Never manufacture live intelligence.** Simulated/demo data must be explicitly marked and visually separated from observed data.
3. **Public and authorized sources only.** Camera integrations are limited to public/authorized government, transport, weather and other legitimate feeds.
4. **Source fusion, not source flattening.** Correlated reports remain individually inspectable.
5. **Human-readable confidence.** Confidence must explain why it exists; AI output is analysis, not evidence.
6. **Hebrew first, English always available.** RTL is a first-class layout, not a translated skin.
7. **Graceful degradation.** Basemap/data-provider failures must never leave an unexplained blank interface.

## Canonical provenance model

Every normalized record should expose, where applicable:

- source_id / source_name
- source_url
- source_type
- observed_at
- ingested_at
- last_verified_at
- freshness: live | near_live | delayed | static | unknown
- evidence_class: observed | reported | inferred | simulated
- confidence: 0..1
- confidence_reasons[]
- attribution / license
- raw_reference or immutable source reference

UI badges must derive from these fields. Do not label an item LIVE solely because it arrived recently.

## Architecture

### Web application
Next.js remains the presentation/BFF layer and Vercel deployment target. It owns:
- map/globe UI
- bilingual i18n and RTL/LTR
- search and filtering
- source/evidence inspector
- case/workspace UI
- read-oriented API routes

### Ingestion services
Continuous feeds and WebSockets should live outside request-scoped serverless functions. Adapters normalize public feeds into the canonical schema.

### Fusion engine
Correlates records by time, geography and entity identifiers. A fused incident contains links to evidence; it never destroys the underlying records.

### Storage
Separate:
- normalized entities/events
- time-series observations
- source health
- saved cases/watchlists
- optional semantic index for analyst search

## Planned UI

- Hebrew default with English toggle
- map + globe modes
- layer/source health center
- evidence drawer for every selected item
- camera viewer with LIVE / NEAR-LIVE / SNAPSHOT / OFFLINE state
- timeline and historical replay
- area-of-interest analysis
- incident fusion view
- analyst query panel with citations to underlying records
- explicit stale/offline/error states

## Safe scope

The platform is for legitimate public-source analysis. It does not add credential bypass, private-camera access, unauthorized system access, covert tracking of private individuals, or mechanisms intended to defeat access controls.

## Delivery sequence

1. Trust/provenance types + source-health contract
2. Hebrew/English i18n + RTL shell
3. Camera/feed status normalization
4. Basemap retry/fallback UX
5. Adapter registry and source health
6. Timeline/replay
7. Correlation/fusion
8. Evidence-grounded analyst
