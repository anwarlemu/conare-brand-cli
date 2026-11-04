---
name: menu
title: Menu
type: registry:ui
group: ui
description: "A button that opens a short list of choices or actions: a square panel in a hairline, rows with a red square marker, counts and a check. Arrows, Home, End, Escape and Tab are handled."
use_for: "Switching organization, account actions, picking a scope or a page."
never:
  - "Writing your own outside-click or arrow handling"
  - "Two or three views of one thing (use Tabs)"
  - "Shadows: the border sets it apart"
source: "conare-web app/composables/useMenu.ts, app/components/console/WorkspaceMenu.vue, app/assets/css/console2.css (.v2-menu)"
files:
  - components/ui/Menu.vue
  - components/ui/MenuItem.vue
  - components/ui/MenuLabel.vue
  - components/ui/MenuSeparator.vue
examples:
  - "Product | The organization switcher | center"
---
