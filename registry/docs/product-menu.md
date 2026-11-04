---
name: product-menu
title: Product menu
type: registry:ui
group: site
description: "The header's Product dropdown: the products with their one line, a rule, then benchmarks and pricing, beside a window that shows the one pointed at. One highlight glides between items. It is the navigation menu."
use_for: "The site header's Product item (shadcn's navigation-menu)."
never:
  - "Links that are not products"
  - "Opening on hover on touch screens: there it opens on press"
source: "conare-web app/components/home/ProductMenu.vue, app/content/home.ts, app/assets/css/home.css (.menu-mark, .menu-mark-dot, .menu-text, .step-art, .footer-grain, .nav-link)"
files:
  - components/site/ProductMenu.vue
examples:
  - "Site | The Product menu"
---

ProductMenu renders an `<li>`: put it first in the header's list of links (SiteHeader does). Give each item its
window through the `window` slot (`item`, `index`, `active`, `plays`, which changes each time a window should play
again): the website uses its product windows (`product-viz`, `eval-viz` and `price-viz`) over a `cell-burst`, as the
example does. Without the slot each item shows a small plain window with its name and line. The highlight is
`glide-mark`'s `useGlideMark`.
