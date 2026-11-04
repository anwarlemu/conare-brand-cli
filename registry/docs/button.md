---
name: button
title: Button
type: registry:ui
group: ui
description: "Every action in the console: secondary by default; dark for the one main action, the website's pixel button with red squares running in on hover; ghost for tools in rows; danger for what removes something, held to confirm; brand for the fix to a failure; and a square icon button."
use_for: "Any action in place: create, copy, save, revoke, open a menu. One dark button per view; the rest secondary or ghost. 28px tall with 12px labels, 40px on phones."
never:
  - "Two dark buttons on one view"
  - "A faded button for \"not yet\": disabled is grey with a dark label"
  - "Red text on a secondary button instead of the danger variant"
  - "A size change on hover"
source: "conare-web app/assets/css/console2.css (.v2-btn, .v2-px, .v2-hold), app/components/console/PixelButton.vue, HoldButton.vue, composables/usePixelGrid.ts"
files:
  - components/ui/Button.vue
  - components/ui/PixelButton.vue
  - components/ui/HoldButton.vue
examples:
  - "Product | The console's buttons"
  - "Dark | Dark | center half"
  - "Handoff | Dark, handing off | center half"
  - "Secondary | Secondary | center half"
  - "Ghost | Ghost | center half"
  - "Icon | Icon | center half"
  - "Danger | Danger, held | center half"
  - "Brand | Brand | center half"
  - "States | States | center"
---
