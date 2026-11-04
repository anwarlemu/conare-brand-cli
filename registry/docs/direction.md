---
name: direction
title: Direction
type: registry:ui
group: ui
description: "Sets the reading direction for what is inside it, left to right or right to left, and gives it to components through useDirection(). Logical utilities follow it; code stays left to right, as the code windows do."
use_for: "A page or a block in a right-to-left language."
never:
  - "Flipping code, keys or IDs"
  - "Physical left and right utilities inside it: use start and end"
source: "New in Conare's style (no Conare equivalent): the dir attribute with code windows held ltr"
files:
  - components/ui/Direction.vue
examples:
  - "Product | Either direction"
---
