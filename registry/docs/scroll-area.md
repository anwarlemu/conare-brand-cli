---
name: scroll-area
title: Scroll area
type: registry:ui
group: ui
description: "A region that scrolls on its own with the console's thin scrollbars: the thumb in neutral-600 on a clear track, neutral-400 on the dark window. Native scrolling, so wheel, touch and keyboard all work."
use_for: "A long list in a fixed box, a wide row that scrolls sideways, code in a dark window."
never:
  - "Custom drawn scrollbars that break native scrolling"
  - "A scroll box a keyboard can't reach: give it a label"
  - "Hiding the scrollbar on content people need to find"
source: "conare-web app/assets/css/main.css (html scrollbar-color), app/assets/css/console2.css (.v2-agentwin-code)"
files:
  - components/ui/ScrollArea.vue
examples:
  - "Product | A list and a row"
---
