---
name: skeleton
title: Skeleton
type: registry:ui
group: ui
description: "Loading that is never empty: a held part is the real part drawn from a blank record, its layout and rules kept and its content hidden, so nothing moves when the answer lands. The rules come in after 300ms, so a fast answer never shows them."
use_for: "Table rows, cards and lists while their data loads. The dot matrix beside a word for work that takes longer."
never:
  - "A shimmer block or gray bars"
  - "A layout that jumps when the data lands"
  - "Showing the rules before 300ms"
source: "conare-web app/assets/css/console2.css ([data-held], .v2-held-in), app/composables/useHeld.ts"
files:
  - components/ui/Skeleton.vue
examples:
  - "Product | Held rows"
---
