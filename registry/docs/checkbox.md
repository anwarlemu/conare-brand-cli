---
name: checkbox
title: Checkbox
type: registry:ui
group: ui
description: "A yes or no inside a form: a 16px square in the hairline that fills ink with a drawn check when on, a bar when partly on."
use_for: "Choices sent with a form: events to send, terms to accept, options of a key."
never:
  - "A setting that takes effect at once (use Switch)"
  - "Round boxes"
  - "A red box at rest"
source: "New in Conare's style: the switch's focus and ink (console2.css .v2-switch), the field's #C3C1BF hairline (.v2-input)"
files:
  - components/ui/Checkbox.vue
examples:
  - "Product | In the product"
---

A native checkbox drawn square, so the keyboard, forms and screen readers work as usual. `v-model` is the state, `label` or the slot the text and `hint` a muted line under it; `indeterminate` shows the bar. The check draws in 160ms on the strong ease-out and goes in 120ms. The row is 28px (40px on phones) and wholly pressable. Focus is the switch's 2px red outline.
