---
name: form
title: Form
type: registry:ui
group: ui
description: "Fields stacked with their labels, errors shown once a field is left or the form is sent, a failure from the server above the actions, and the main action last."
use_for: "Creating or changing a thing with several fields: a key, an invite, a namespace."
never:
  - "Errors while the first value is still being typed"
  - "The browser's own error bubbles"
  - "A red border at rest"
source: "New in Conare's style, composed from Field, Input and Button (console2.css .v2-input, main.css .c-help-error)"
files:
  - components/ui/Form.vue
  - composables/useForm.ts
examples:
  - "Product | In the product"
---

`useForm(initial, rules)` holds `values`, the `errors` to show now, `sending` and `failure`. Each rule returns a message or nothing. Call `touch(key)` when a field is left. `submit(send)` checks every rule, runs `send` only when all pass and turns a thrown Error into `failure`. `<Form>` lays the fields 16px apart, shows `failure` in the red wash, puts the `actions` slot at the end and, on a send with errors, moves focus to the first field marked invalid.
