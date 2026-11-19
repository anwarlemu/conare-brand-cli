---
name: pricing-table
title: Pricing table
type: registry:ui
group: site
description: "One group of prices: its case on the left, its cards on the right in the double rule. Each card's price large in tabular figures with its unit, one line, and what it includes led by the red square."
use_for: "A pricing page, one table per group of prices."
never:
  - "A plan marked as the popular one: the prices make the case"
  - "Prices without their unit"
  - "A button on every card: the page's head carries the one action"
source: "conare-web app/pages/pricing.vue (each group: its case, its cards in the double rule), app/content/pricing.ts"
files:
  - components/site/PricingTable.vue
examples:
  - "Site | One group of prices"
---

Give each table its own `titleId` when a page has several. An odd last card takes the whole row.
