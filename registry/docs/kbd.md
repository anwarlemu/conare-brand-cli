---
name: kbd
title: Kbd
type: registry:ui
group: ui
description: "A key or a shortcut: 11px in the face around it, plain or in a hairline box, hidden on touch screens."
use_for: "The shortcut at the end of the sidebar's search and of a command; keys named in help text."
never:
  - "Shortcuts on touch screens"
  - "Mono or capitals for key names"
source: "conare-web app/assets/css/console2.css (.v2-side-search kbd), app/components/home/PromptBar.vue (the boxed key)"
files:
  - components/ui/Kbd.vue
examples:
  - "Product | In the product | center"
---

Plain by default, in the colour around it. `boxed` draws the prompt bar's 1px box at 24% of the text colour with 4px across. It hides where the pointer is coarse.
