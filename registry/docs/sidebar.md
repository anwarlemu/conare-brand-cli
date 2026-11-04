---
name: sidebar
title: Sidebar
type: registry:ui
group: ui
description: "The console's navigation: a label over each group, a row with its icon and count, a red edge on the page you are on, and a count that turns red when something failed."
use_for: "Moving between the console's pages. It stays open; on a phone the app shows it as a drawer over the page."
never:
  - "Counts that never change"
  - "A second level of rows: a page's own sections go in Tabs"
source: "conare-web app/assets/css/console2.css (.v2-side, .v2-nav-label, .v2-nav-link, .v2-nav-status)"
files:
  - components/ui/Sidebar.vue
  - components/ui/SidebarLabel.vue
  - components/ui/SidebarLink.vue
examples:
  - "Product | The console's navigation | center"
---
