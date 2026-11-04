---
name: command-palette
title: Command palette
type: registry:ui
group: product
description: "One box for everything, opened by ⌘K, / or the sidebar's search: documents as you type, namespaces, pages and actions. It opens and closes without animation; the input keeps focus and the arrows move the highlighted row."
use_for: "Jumping anywhere and finding any document from any page of the console."
never:
  - "An open or close animation: it is used many times a day"
  - "Tab moving focus out of the box"
  - "Fetching inside it: the app passes documents for the query it hears"
source: "conare-web app/components/console/Command.vue, app/assets/css/console2.css (.v2-cmd, .v2-cmd-box, .v2-cmd-list, .v2-cmd-bar, .v2-cmd-foot, .v2-cmd[data-skin=\"1\"])"
files:
  - components/product/CommandPalette.vue
examples:
  - "Product | The sidebar's search | center"
---

Bind ⌘K and / in the app to `open = true`. Listen for `query` and pass back `documents` (and `searching` while they
load). `select` gives `{ kind: 'search' | 'document' | 'namespace' | 'page' | 'action', ... }`; it closes on every pick
but the search row, which the app opens as a full search. `tone="light"` draws it on the paper without the title bar.
