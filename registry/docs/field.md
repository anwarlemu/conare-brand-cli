---
name: field
title: Field
type: registry:ui
group: ui
description: "Text input: 32px, a hairline that goes ink on focus, an optional leading icon at the 28px filter size, and a red border with its message when invalid. Field puts the label over it and the hint or error under it."
use_for: "Names, filters, queries and JSON filters. Every field has a visible label or an aria-label."
never:
  - "A placeholder in place of a label"
  - "A red border at rest"
  - "Inputs under 16px on phones (the field switches to 16px there)"
source: "conare-web app/assets/css/console2.css (.v2-input, .v2-input-icon), app/design-system/examples/field/Product.vue"
files:
  - components/ui/Input.vue
  - components/ui/Field.vue
examples:
  - "Product | Labels, icons and hints"
---
