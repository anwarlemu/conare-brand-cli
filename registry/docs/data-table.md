---
name: data-table
title: Data table
type: registry:ui
group: ui
description: "A table people narrow and order: filter buttons over it (Label, or Label: pick, the menu's check on the choice), heads that sort, and five rows at a time with Show N more under them, each new row landing on the one above."
use_for: "Namespaces, sources, searches and logs long enough to filter."
never:
  - "Paging a list read from the top: show more"
  - "Filters that hide that they are on: the button says the pick"
  - "Sorting a column of mixed kinds"
source: "conare-web app/components/console/search/FilterChip.vue, FilterMenu.vue, billing/Grants.vue (show more), app/assets/css/console2.css (.v2-scope, .v2-table, .v2-more, .v2-ledger li[data-new])"
files:
  - components/ui/DataTable.vue
  - components/ui/DataTableFilter.vue
examples:
  - "Product | Filter, sort and show more"
---
