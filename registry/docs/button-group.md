---
name: button-group
title: Button group
type: registry:ui
group: ui
description: "Buttons that belong together sharing a hairline: secondary buttons in a row, or the dark split button with its menu arrow."
use_for: "The agent prompt's Copy prompt with its other ways to connect; a pager's previous, page and next."
never:
  - "Unrelated actions side by side (space them instead)"
  - "Two dark groups in one view"
source: "conare-web app/components/console/agent/Split.vue, app/assets/css/console2.css (.v2-split, .v2-split-arrow)"
files:
  - components/ui/ButtonGroup.vue
examples:
  - "Product | In the product"
---

New in Conare's grammar, from the split button. Each child overlaps the one before by 1px, and the hovered or focused one sits on top so its ink edge shows whole. Between two dark halves (PixelButton, or a dark trigger) it draws the split's 1px line at 24% of the light colour. The branch's split also runs the copy's red squares on into the arrow; this group keeps each half's own hover. `vertical` stacks them.
