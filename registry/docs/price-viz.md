---
name: price-viz
title: Price window
type: registry:ui
group: visuals
description: "Accuracy against price as a window: each provider a square point on a log price axis, the model's own in red with the corner nothing beats; pointing at a point or its row scopes it with a crosshair, brackets, axis readouts and its exact figures."
use_for: "Price and accuracy on the website, the product menu and an eval's page."
never:
  - "Prices that differ from the pricing page"
  - "A linear price axis: prices span orders of magnitude"
source: "conare-web app/components/home/PriceViz.vue, app/content/evals.ts (priceAccuracy), app/assets/css/home.css (.price-*, .viz-*)"
files:
  - components/visuals/PriceViz.vue
examples:
  - "Site | On the site"
---
