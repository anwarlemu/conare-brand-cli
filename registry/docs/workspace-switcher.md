---
name: workspace-switcher
title: Workspace switcher
type: registry:ui
group: product
description: "The sidebar head's organization switcher: the brand mark, the organization over its customer and role, and a menu of every organization grouped by customer, the current one checked, then New organization, settings and members."
use_for: "Sidebar's head slot, wherever a person reaches more than one organization."
never:
  - "Switching without saying which organization is opening"
  - "A round avatar: organizations are square tiles"
source: "conare-web app/components/console/WorkspaceMenu.vue, app/assets/css/console2.css (.v2-trigger, .v2-ws-name, .v2-ws-meta, .v2-tile, .v2-menu-tag)"
files:
  - components/product/WorkspaceSwitcher.vue
examples:
  - "Product | The organization switcher | center"
---

v-model is the current organization's id; set `switching` to the id while the app opens it (the row reads "opening"
and the others wait), and `error` if that fails. Put the brand mark in the `mark` slot.
