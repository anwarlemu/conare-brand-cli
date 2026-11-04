---
name: glide-mark
title: Gliding block
type: registry:ui
group: visuals
description: "One block for a whole list: it glides to the row under the pointer in 200ms and rests on the picked one when the pointer leaves, so moving down a list is one movement."
use_for: "Lists read by moving down them, such as prices, suggestions and the docs' sidebar."
never:
  - "A row of separate hover fills in the same list"
  - "Touch screens: it follows the pointer only"
source: "conare-web app/composables/useGlideMark.ts, app/assets/css/console2.css (.v2-rowmark, .v2-priced)"
files:
  - components/visuals/GlideMark.vue
  - composables/useGlideMark.ts
examples:
  - "Product | In the product | center"
---

`useGlideMark(list, rest)` measures the list's `[data-glide-row]` children: call `point(i)` on pointer enter and focus, `leave()` on pointer leave, and `settle()` after the pick changes. `rest` returns the row to rest on, or null to hide. Draw the block with `<GlideMark :mark :instant />` first in the list, and lift the rows above it (`relative z-1`).
