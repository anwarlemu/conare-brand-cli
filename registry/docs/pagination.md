---
name: pagination
title: Pagination
type: registry:ui
group: ui
description: "Pages of a long list: two secondary icon buttons around the page count in tabular figures. Show more is the quiet line under a list that opens a few more at a time, the console's usual way."
use_for: "Show more under credits added, matches and history; pages only where a page is a place to come back to, such as an audit log."
never:
  - "Numbered page links in the console"
  - "Pages for a list read from the top"
  - "Infinite scroll"
source: "conare-web app/assets/css/console2.css (.v2-more), app/components/console/billing/Grants.vue; pages are new, on Button"
files:
  - components/ui/Pagination.vue
  - components/ui/ShowMore.vue
examples:
  - "Product | Pages and show more"
---
