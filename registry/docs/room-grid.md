---
name: room-grid
title: Room grid
type: registry:ui
group: visuals
description: "The hero frame as a room in one-point perspective: orthogonals to the back wall and rings closing up as they recede. A tile lights under the pointer, and a few light on their own, trading places while the frame is on screen."
use_for: "Behind the hero's window, with the burst."
never:
  - "Anywhere but the hero"
  - "Tiles lighting for reduced motion: they hold still"
source: "conare-web app/components/home/RoomGrid.vue, app/assets/css/home.css (.room-tiles)"
files:
  - components/visuals/RoomGrid.vue
examples:
  - "Site | On the site"
---
