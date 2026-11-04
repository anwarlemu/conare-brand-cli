---
name: slider
title: Slider
type: registry:ui
group: ui
description: "A value on a range: the meter's 4px track with ink up to the value and a square 12px ink thumb."
use_for: "A number where the range matters more than the exact figure: passages per search, a minimum score."
never:
  - "Exact values a person would rather type (use Input)"
  - "A round or growing thumb"
  - "Animating the thumb: it follows the hand"
source: "New in Conare's style: the meter's track (console2.css .v2-meter), the switch's square thumb and red focus (.v2-switch)"
files:
  - components/ui/Slider.vue
examples:
  - "Product | In the product"
---

A native range input, so arrows, Page Up and Down, Home and End work. `v-model` is the number; `min`, `max` and `step` as usual; `label` names it and `valueText` reads a formatted value. Show the value beside it in tabular figures. The row is 28px (40px on phones) and takes the pointer anywhere along it.
