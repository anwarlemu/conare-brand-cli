---
name: stat
title: Stat
type: registry:ui
group: ui
description: "A label over a number in a row of stats, split by hairlines. A stat that drives a chart is a button: it fills with the paper under the pointer, and the pinned one stays filled with a red edge on top."
use_for: "The few numbers a card is about: queries this month, today, latency."
never:
  - "More than four in a row"
  - "A stat with no unit or period"
source: "conare-web app/assets/css/console2.css (.v2-stats, .v2-stat, .v2-stat-value)"
files:
  - components/ui/Stats.vue
  - components/ui/Stat.vue
examples:
  - "Product | In the product"
---
