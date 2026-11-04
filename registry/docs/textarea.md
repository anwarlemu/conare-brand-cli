---
name: textarea
title: Textarea
type: registry:ui
group: ui
description: "Several lines of text: 13px on 20px lines, the hairline that darkens on hover and turns to a 2px ink edge on focus, red when invalid."
use_for: "Pasted text, a note, a description. Put it in a Field."
never:
  - "A question to search (use the search box)"
  - "A red border at rest"
  - "Under 16px on phones"
source: "conare-web app/assets/css/main.css (textarea.c-input), console2.css (.cv2 .c-input: square), app/components/console/AddDocuments.vue"
files:
  - components/ui/Textarea.vue
examples:
  - "Product | In the product"
---

`v-model` is the text, `rows` the height (4), `invalid` the red edge. Focus thickens the edge to 2px while the padding gives a pixel back, so the text does not move. It grows by hand downward only.
