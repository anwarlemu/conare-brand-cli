---
name: search-run
title: Search run
type: registry:ui
group: product
description: "A search on the request's clock: Searching shimmers over the namespaces it reads while cells of the index flicker; then Found in, the namespaces with results keep a red square, each document found is a red square that names itself, and the footer gives the count, when it finished, the API's time and Show code."
use_for: "Home and the command palette, while a search runs and after, under the results."
never:
  - "Fake delays: it follows the request"
  - "Running when nothing was asked"
  - "Red beyond the found squares and the count"
source: "conare-web app/components/console/SearchRun.vue, app/assets/css/console2.css (.v2-run, .v2-runchip, .v2-index, .v2-flick, .v2-hit, .v2-hitbtn, .v2-shimmer)"
files:
  - components/product/SearchRun.vue
examples:
  - "Product | In the product"
---

Pass `code`, the request as your app sends it, and the footer ends on Show code (`code-pop`): the request opens under
the footer in the dark code window. Without it the footer stops at the API's time.
