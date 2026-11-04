---
name: suggestion-chips
title: Suggestion chips
type: registry:ui
group: product
description: "Questions to start from under the search box, each ending on the namespace that answers it; a block glides to the one pointed at."
use_for: "Home, before anything is asked."
never:
  - "Questions the data cannot answer"
  - "More than one row on a desktop"
source: "conare-web app/components/console/search/SuggestChips.vue (take 3, the gliding block), app/assets/css/console2.css (.v2-chip-tagged, .v2-chip-mark, .v2-sg-tag)"
files:
  - components/product/SuggestionChips.vue
examples:
  - "Product | In the product"
---

`items` are `{ q, ns, logo? }`: the question, the namespace and the app's 10px mark. Picking one emits `ask` with it. The paper block glides on transform and size in 160ms on the console's curve, placed without a glide the first time the pointer arrives, and fades in 120ms when it leaves. The tag under it goes a shade darker. The branch's other two takes (the pixel fill and the roll) were not picked and are not ported.
