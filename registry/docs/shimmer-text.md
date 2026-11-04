---
name: shimmer-text
title: Shimmer text
type: registry:ui
group: visuals
description: "Words that say something is working: a lighter band runs across them for as long as the work does. Reduced motion shows them still."
use_for: "A search or a sync under way, in the few words that say so."
never:
  - "Text that is already done"
  - "Whole sentences of body text"
  - "A shimmering block in place of a loading row (rows keep their layout)"
source: "conare-web app/assets/css/console2.css (.v2-shimmer)"
files:
  - components/visuals/ShimmerText.vue
examples:
  - "Product | In the product | center half"
---

The band runs right to left every 1.4s in the muted grey's lighter step. Remove it when the work ends, and put the sentence in `role="status"` so the change is read out. Pair it with the dot matrix (Loader) when the wait is long.
