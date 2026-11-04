---
name: text-swap
title: Text swap
type: registry:ui
group: visuals
description: "Two labels in one cell, so nothing around them moves: the first leaves up, the next arrives from below with a touch of blur, and a check draws its stroke."
use_for: "A button or a status that changes its words in place: Copy prompt to Copied, Connect to Connected."
never:
  - "Labels of very different lengths: the cell takes the longer and the button would look loose"
  - "More than two states (use FixButton's stacked states)"
source: "conare-web app/assets/css/console2.css (.v2-swap), app/design-system/examples/text-swap/Product.vue (example-only in the branch)"
files:
  - components/visuals/TextSwap.vue
examples:
  - "Product | In the product | center half"
---

`on` picks the label: the `a` slot when false, `b` when true. The leaving label fades and blurs over 160ms while it moves 5px in 220ms on the strong ease-out; a Lucide check in `b` draws its stroke after 40ms. The hidden label is `aria-hidden`, so a screen reader reads the current one. Reduced motion keeps the cross-fade only.
