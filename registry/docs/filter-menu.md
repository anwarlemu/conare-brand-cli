---
name: filter-menu
title: Filter menu
type: registry:ui
group: product
description: "Every filter in one menu from the search box's bar: app, type and date as radio groups, the button counting what is on. A second press clears a pick; the menu stays open for the next."
use_for: "Narrowing a search or a list by a few independent facets."
never:
  - "Filters that apply only after a separate Apply button"
  - "Checkboxes inside a group that takes one value"
source: "conare-web app/components/console/search/FilterMenu.vue, app/utils/searchFilters.ts, app/assets/css/console2.css (.v2-scope, .v2-filter-count, .v2-menu)"
files:
  - components/product/FilterMenu.vue
examples:
  - "Product | Search filters"
---

Pass `groups` (`key`, `label`, `options`) and a v-model object with one value per key (`''` or `0` for none). For one
button per filter, each naming its pick, use `filter-chip` instead: the console ships one or the other, not both.
