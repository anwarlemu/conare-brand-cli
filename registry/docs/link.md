---
name: link
title: Link
type: registry:ui
group: ui
description: "Text that goes somewhere: ink with a quiet underline 4px under it that turns ink on hover, and the quiet link under a list that shows more of it."
use_for: "Links inside sentences and short link rows; Show 5 more under a list."
never:
  - "Red links"
  - "Links that look like buttons, or buttons that look like links"
  - "An underline that moves or thickens on hover"
source: "conare-web app/assets/css/console2.css (.v2-link, .v2-more), app/design-system/examples/link/Product.vue"
files:
  - components/ui/Link.vue
examples:
  - "Product | In the product"
---

`href` makes it an anchor (or pass `as` a router link component). `more` is the quiet link under a list: 12px medium in the soft grey, ink on hover, a button unless it has an href, with a 40px place to land on phones.
