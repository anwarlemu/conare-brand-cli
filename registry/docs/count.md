---
name: count
title: Count
type: registry:ui
group: ui
description: "The one counter: a number that counts to its new value when it changes, so a syncing source's documents visibly climb. Reduced motion shows the new value at once."
use_for: "Numbers that change while the person watches: documents, rows read, the amount of the row pointed at."
never:
  - "Numbers that never change on the page"
  - "A count that rolls on every visit: use `once`"
source: "conare-web app/components/console/Count.vue, app/composables/useFirstVisit.ts"
files:
  - components/ui/Count.vue
examples:
  - "Product | In the product | center"
---

It eases to each new `value` over 700ms. `rolls` counts up from zero as it lands; `once="key"` does that only the first time the key shows in the tab's session. `format` reads it as an amount or a share (a function from the number to its text); plain counts get thousands separators. Figures are tabular, so the width holds.
