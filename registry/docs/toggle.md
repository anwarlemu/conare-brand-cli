---
name: toggle
title: Toggle
type: registry:ui
group: ui
description: "A pressable chip that stays on: a red square at its start and an ink edge while it is on."
use_for: "One option in a row of options or filters: exact words, include archived."
never:
  - "A setting saved at once (use Switch)"
  - "A pick of one from several (use ToggleGroup or Tabs)"
source: "conare-web app/assets/css/console2.css (.v2-chip, .v2-chip-pick with aria-pressed)"
files:
  - components/ui/Toggle.vue
examples:
  - "Product | In the product | center"
---

`v-model` is pressed or not (`aria-pressed`). On hover the 4px red square shows and the edge goes ink; while on, both stay. A press gives the paper fill. 40px on phones.
