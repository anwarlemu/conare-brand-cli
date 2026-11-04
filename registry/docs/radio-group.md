---
name: radio-group
title: Radio group
type: registry:ui
group: ui
description: "One of a few, all in view: square 16px boxes with an ink square in the picked one, rows 28px with a label and an optional hint."
use_for: "Two to five options that each need a line: a reading mode, a region, a plan."
never:
  - "Round radios"
  - "More than five options (use NativeSelect or Menu)"
  - "Views of one thing (use Tabs)"
source: "New in Conare's style: the field's hairline (console2.css .v2-input), the switch's ink and red focus (.v2-switch)"
files:
  - components/ui/RadioGroup.vue
examples:
  - "Product | In the product"
---

Native radios drawn square, so arrows move the pick and the group is one Tab stop. `options` are `{ value, label, hint?, disabled? }`, `label` names the group, `inline` lays them in a row. The picked box takes an ink edge and its 8px square settles in from 0.6 in 120ms (reduced motion fades it). Focus is the switch's red outline.
