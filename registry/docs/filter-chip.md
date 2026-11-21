---
name: filter-chip
title: Filter chip
type: registry:ui
group: product
description: "One filter as a menu button under the search box: its name, or the name and the pick once chosen, opening a radio list with Any first."
use_for: "The search's filters: app, type, author. A few side by side."
never:
  - "A long list without a filter (use the scope menu)"
  - "Several picks in one chip"
source: "conare-web app/components/console/search/FilterChip.vue, app/assets/css/console2.css (.v2-scope, .v2-chev), app/design-system/examples/filter-chip/Product.vue (example-only in the branch)"
files:
  - components/product/FilterChip.vue
examples:
  - "Product | In the product"
---

`label` names the filter, `any` the first row (its value is `''`, or `0` for numeric options), `options` the rest. The chip is 28px on the paper with a hairline; it takes an ink edge and the white ground while something is chosen or the menu is open, and its chevron turns. The menu is Menu's panel with `menuitemradio` rows and a check on the pick; arrows, Home, End and Escape work as in every Menu.

Its list scrolls under a fade (`fade-y`) at the edge with more past it.
