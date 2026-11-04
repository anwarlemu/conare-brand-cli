---
name: cell-burst
title: Cell burst
type: registry:ui
group: visuals
description: "Seeded square cells bursting from a point: a sheet of cells with some redrawn smaller and smaller down to a vanishing point, each a wedge of hairlines. Jumble scatters it, ledger makes it a spreadsheet's, strong holds up on the red, trace sets the grid redrawing itself. Grain is the texture it sits under."
use_for: "The website's illustrations of data being found and processed: the blog cards, How it works, the closing band, a work panel."
never:
  - "Inside the console's pages"
  - "Running off screen: it draws as the panel nears the screen"
  - "Over text"
source: "conare-web app/components/home/CellBurst.vue, app/utils/cells.ts, app/composables/useNearView.ts, app/assets/css/home.css (.art-in, .cell-trace, .footer-grain)"
files:
  - components/visuals/CellBurst.vue
  - components/visuals/Grain.vue
examples:
  - "Site | On the site"
---
