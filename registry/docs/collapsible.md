---
name: collapsible
title: Collapsible
type: registry:ui
group: ui
description: "A part that opens in place and pushes what follows: the row grows to its content over 260ms and closes in 180ms, the content fading up from a slight blur, the chevron turning. From the keyboard it opens at once."
use_for: "Folding away what most people skip: advanced settings, the request behind a result, a long prompt."
never:
  - "The main content of a page"
  - "Several that should open one at a time: that is an accordion"
source: "conare-web app/assets/css/console2.css (.v2-collapse, .v2-prompt-text, .v2-chev), app/components/console/CodePop.vue (opens in place). New in Conare's style: shadcn's collapsible."
files:
  - components/ui/Collapsible.vue
examples:
  - "Product | Advanced settings"
---
