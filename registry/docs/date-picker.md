---
name: date-picker
title: Date picker
type: registry:ui
group: ui
description: "A date in a field: the 32px text field that opens a Calendar in Menu's square panel under it, flipping above when there is no room. Picking closes it and returns focus to the field; Escape closes it unchanged."
use_for: "A date in a form: an expiry, a report's range start."
never:
  - "A native date input beside it: one way to pick"
  - "A red border at rest: only when invalid, with Field's message"
source: "conare-web app/assets/css/console2.css (.v2-input, .v2-menu). New in Conare's style: shadcn's date picker, Calendar in a Popover with a Field trigger."
files:
  - components/ui/DatePicker.vue
examples:
  - "Product | A key's expiry"
---
