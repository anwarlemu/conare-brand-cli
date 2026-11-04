---
name: top-bar
title: Top bar
type: registry:ui
group: ui
description: "The 48px bar over every console page: breadcrumbs, each step back a link, the page itself in ink, a namespace in mono. Its crumbs are the breadcrumb."
use_for: "Saying where you are and the way back, over every console page."
never:
  - "Repeating the page's title as a heading right under it"
  - "Actions that belong to the page: they go in the page's head"
source: "conare-web app/layouts/console.vue (the header), app/assets/css/console2.css (.v2-bar, .v2-crumb, .v2-mono)"
files:
  - components/ui/TopBar.vue
  - components/ui/Breadcrumb.vue
examples:
  - "Product | The console's bar"
  - "Breadcrumb | A long trail"
---

`Breadcrumb` is shadcn's breadcrumb: pass `items` (`label`, `href`, `mono`), the last is the page. Give `as` your router
link (`NuxtLink`) to navigate without a reload.
