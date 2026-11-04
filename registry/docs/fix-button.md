---
name: fix-button
title: Fix button
type: registry:ui
group: product
description: "The fix for a failure: the website's dark button that signs in, counts the changes as they come back and ends on a check, all in one cell."
use_for: "Reconnecting a source that stopped syncing, in its row or in Home's banner."
never:
  - "Actions that are not a fix"
  - "Two on one view"
  - "Moving the row while it works: every state stays in its cell"
source: "conare-web app/components/console/namespaces/FixButton.vue, app/assets/css/console2.css (.v2-fixbtn, .v2-states), app/design-system/examples/button/Brand.vue"
files:
  - components/product/FixButton.vue
examples:
  - "Product | In the product"
---

`state` is `broken`, `signing`, `catching` or `done`; the app moves it along after `press`. `count` is the changes so far (it counts up with Count, and the last count stays). `app` names the source in the label and for screen readers. `tone="red"` is the red version, its squares running black. The black wipes off in 420ms (`--ds-duration-wipe`), longer than the console's usual 320ms ceiling because it reports a rare, slow action.
