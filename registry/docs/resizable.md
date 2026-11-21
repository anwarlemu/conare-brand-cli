---
name: resizable
title: Resizable
type: registry:ui
group: ui
description: "Two panes and the hairline between them, as the docs panel sits beside the page. The hairline turns ink under the pointer, while dragged and when focused; drag it or use the arrow keys."
use_for: "A page beside its docs, a list beside the item it opens, a page beside the text read from it."
never:
  - "A thick grip or a dotted handle: the hairline is the handle"
  - "Panes that can close to nothing: set a minimum"
source: "New in Conare's style, from conare-web app/assets/css/console2.css (.v2-docs: the hairline edge beside the page)"
files:
  - components/ui/Resizable.vue
examples:
  - "Product | A page and its docs"
---

Each pane scrolls under a fade (`fade-xy`, down and across) at the edge with more past it.
