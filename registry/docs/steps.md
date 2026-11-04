---
name: steps
title: Steps
type: registry:ui
group: ui
description: "Steps that open one at a time: the one to do is the only open thing, a finished step folds to a line that says what came of it, and a step not reached is dimmed and locked."
use_for: "A short job done in order on one page, such as sending data by API or setting up single sign-on."
never:
  - "Steps that could be done in any order"
  - "More than five"
source: "conare-web app/components/console/byapi/Step.vue, app/components/console/Opens.vue, app/composables/useMoveSteps.ts, app/assets/css/console2.css (.v2-movesteps, .v2-movestep, .v2-rowgrow)"
files:
  - components/ui/Steps.vue
  - components/ui/Step.vue
  - composables/useSteps.ts
examples:
  - "Product | Three steps | center"
---

`useSteps()` keeps the state: `state(n)` for each Step, `reach(n)` when a step is done (it opens the next), `toggle(n)`
on a head's `open`, `reset()` to start again.
