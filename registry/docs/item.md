---
name: item
title: Item
type: registry:ui
group: ui
description: "One row of a card's list: 12px, its title on the left and what it is on the right, a hairline between rows. A row that opens something is one link that fills to the card's edges with the paper under the pointer, its chevron darkening; a row can carry a tool at its end."
use_for: "What a namespace or a key is, settings that open their page, sources as getting started lists them."
never:
  - "Buttons inside a row that is a link"
  - "An arrow that moves on hover"
  - "A row of rows: a table for many columns"
source: "conare-web app/assets/css/console2.css (.v2-rows, .v2-row, .v2-row-link), app/components/console/Source.vue (source-row)"
files:
  - components/ui/Item.vue
  - components/ui/ItemGroup.vue
examples:
  - "Product | In a card"
  - "Sources | Sources"
---
