---
name: product-viz
title: Product window
type: registry:ui
group: visuals
description: "A product as a small window: search's question and best passage, a source syncing, a file parsed to Markdown, an embedding's values as bars, results reranked into a new order."
use_for: "The website's product cards and the header's product menu, one window per product (`id`: search, sync, parse, embed, rerank)."
never:
  - "A window for a product that is not one of the five"
  - "Running while off screen: set `active` only while it is in view"
source: "conare-web app/components/home/ProductViz.vue, app/assets/css/home.css (.viz-*)"
files:
  - components/visuals/ProductViz.vue
examples:
  - "Site | On the site"
---
