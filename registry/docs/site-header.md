---
name: site-header
title: Site header
type: registry:ui
group: site
description: "The website header: the logo, the Product menu and the links on the page's true center with a paper block gliding under them, the two buttons at the edge; below 768px a square button folds the links into a sheet."
use_for: "The top of every website page."
never:
  - "A translucent bar: the red footer under the page would tint it"
  - "More than one dark button in it"
source: "conare-web app/components/home/Header.vue, app/composables/useNavMarks.ts, app/assets/css/home.css (.nav-mark, .nav-link, .menu-btn, .menu-grid, .mobile-menu)"
files:
  - components/site/SiteHeader.vue
examples:
  - "Site | The website header"
---

`actions` renders twice, in the bar and in the phone sheet (`place` says which). Mark where the reader is with a link's
`current`, or `product-current` while the products are on screen.
