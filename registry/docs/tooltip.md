---
name: tooltip
title: Tooltip
type: registry:ui
group: ui
description: "An icon button's name in the inverse fill, 11px, under its trigger: 300ms wait under the pointer, at once on keyboard focus, 125ms in. Right after another tooltip it shows at once."
use_for: "Naming icon buttons in rows and toolbars."
never:
  - "Anything someone needs to read or act on: put it on the page"
  - "A tooltip on a button that already has a label"
  - "Showing on touch: a tap presses the button"
source: "conare-web app/components/console/Copy.vue (version 1's tip, .v2-copy1-tip). New in Conare's style: shadcn's tooltip, on usePopover so it flips and stays inside the viewport."
files:
  - components/ui/Tooltip.vue
examples:
  - "Product | Icon buttons in a row | center"
---
