---
name: hover-card
title: Hover card
type: registry:ui
group: ui
description: "A preview of what a link points to, in Menu's square panel: it opens after the pointer rests 300ms (at once on keyboard focus), lets the pointer cross into it, and closes when the pointer leaves both."
use_for: "A namespace, a source or a document named in text, where a glance saves a click."
never:
  - "The only way to reach what it shows: the link must work on its own"
  - "Actions someone has to take: use Popover or Menu"
  - "Touch: a tap follows the link"
source: "conare-web app/assets/css/console2.css (.v2-menu's panel), app/components/console/Copy.vue (the tooltip's 300ms wait). New in Conare's style: shadcn's hover card."
files:
  - components/ui/HoverCard.vue
examples:
  - "Product | A namespace in a sentence | center"
---
