---
name: aspect-ratio
title: Aspect ratio
type: registry:ui
group: ui
description: "A plain box that keeps its shape as it grows, so a picture or a window never reflows: the blog card's 5:4 picture, the hero's 2:1 frame."
use_for: "Pictures, the website's art panels and viz windows."
never:
  - "Fixed heights for media that scales with the page"
  - "Text content that can outgrow the box"
source: "conare-web app/components/home/BlogCard.vue (aspect-[5/4]), app/design-system/examples/burst (aspect-[2/1])"
files:
  - components/ui/AspectRatio.vue
examples:
  - "Product | Two shapes"
---
