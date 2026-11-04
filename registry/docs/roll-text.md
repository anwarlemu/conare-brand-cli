---
name: roll-text
title: Roll text
type: registry:ui
group: visuals
description: "A label that rolls up to a copy of itself on hover or focus: the console's pace for its lists, the website's for its footer."
use_for: "Short links: the website footer, the console's source list and the docs panel's links."
never:
  - "Long labels that wrap"
  - "Buttons whose label changes, such as Copy and Copied (use TextSwap)"
  - "Touch screens: it rolls only where a pointer can rest"
source: "conare-web app/components/home/RollText.vue, app/assets/css/console2.css and home.css (.roll, .roll-a, .roll-b, .roll-host)"
files:
  - components/visuals/RollText.vue
examples:
  - "Product | In the product"
  - "Site | On the site"
---

Put the class `ds-roll-host` on the link or button that holds it: hovering it (where a pointer can rest) or reaching it with Tab rolls the label in 160ms on the console's curve. `pace="console"` moves the label 110% so no sliver shows; `pace="site"` moves it one line, as the website's footer does. Reduced motion holds it still.
