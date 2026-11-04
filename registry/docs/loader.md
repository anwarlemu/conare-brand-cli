---
name: loader
title: Loader
type: registry:ui
group: ui
description: "The website's dot matrix: a 3 by 3 of 2px squares that blink in a sweep while something works, beside the word for what is working."
use_for: "A search running, a source syncing, a page loading slowly. It appears only after 300ms."
never:
  - "A blank screen while loading"
  - "An empty state before the answer has landed"
  - "Any other spinner"
  - "Loops that run off screen"
source: "conare-web app/components/console/Matrix.vue, app/assets/css/console2.css (.v2-matrix)"
files:
  - components/ui/DotMatrix.vue
examples:
  - "Product | Where the product uses it"
---
