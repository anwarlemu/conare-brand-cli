---
name: native-select
title: Native select
type: registry:ui
group: ui
description: "The browser's own select drawn as the console's field: square, the hairline that darkens on hover and turns to a 2px ink edge on focus, and its own 12px chevron."
use_for: "A pick from a short, fixed list inside a form: a role, an expiry, a namespace. The system picker opens on phones."
never:
  - "A list that needs a filter or marks (use Menu or the scope menu)"
  - "Options that do something at once (use Menu)"
source: "conare-web app/assets/css/main.css (select.c-input, .c-input-sm), console2.css (.cv2 .c-input: square, 32px)"
files:
  - components/ui/NativeSelect.vue
examples:
  - "Product | In the product"
---

Options go in the slot. `small` is the 28px, 12px size for rows of filters; `mono` sets the options in Geist Mono for namespaces and IDs; `invalid` turns the edge red. The chevron is Lucide's ChevronDown at 12px in the muted grey, in place of the branch's inline image, so its colour follows the theme. 40px and 16px on phones.
