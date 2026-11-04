---
name: burst
title: Burst
type: registry:ui
group: visuals
description: "The hero frame's infinite cells on red: level rectangles near the frame's edge, each redrawn as it recedes to the center, the copies' edges making the hatch. Corners adds a halftone square to each face, kept clear of the hero's window."
use_for: "Behind the hero's window, on the red, with the room grid."
never:
  - "On any color but the red frame"
  - "Over text"
  - "Rotated: the cells stay level"
source: "conare-web app/components/home/Burst.vue, app/utils/cells.ts (halftone)"
files:
  - components/visuals/Burst.vue
examples:
  - "Site | On the site"
---
