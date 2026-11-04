---
name: work-panel
title: Card and dark panel
type: registry:ui
group: product
description: "A card beside the dark panel in the website's double rule: the title with its red full stop, one line and the one action; on the panel the grain, a sheet of cells and one small window that plays once."
use_for: "A page whose job is one action with a visible result: Getting started, Agents, Send by API."
never:
  - "Two dark panels on one page"
  - "A window that replays on hover: it plays once"
  - "More than one dark button in the card"
source: "conare-web app/components/console/SetupStep.vue, app/components/console/platform/Setup.vue, app/assets/css/console2.css (.v2-agentwork, .v2-agent-title, .v2-agent-rise, .v2-win), app/assets/css/docs-viz.css"
files:
  - components/product/WorkPanel.vue
  - components/product/WorkWindow.vue
examples:
  - "Product | In the product"
---
