---
name: label
title: Label
type: registry:ui
group: ui
description: "Field's label on its own: 12px in the soft grey, with an optional muted note such as optional."
use_for: "A control that is not in a Field: a slider's name, a group of checkboxes, a custom input."
never:
  - "A placeholder in place of a label"
  - "Capitals or bold"
source: "conare-web app/assets/css/console2.css (the console's form labels), registry Field"
files:
  - components/ui/Label.vue
examples:
  - "Product | In the product | center"
---

`for` ties it to the control's id; `hint` adds the muted note after it. Field already draws this label; use Label where there is no Field.
