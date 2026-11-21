---
name: drawer
title: Drawer
type: registry:ui
group: ui
description: "A panel that slides in from an edge over the page dimmed to 16%: the console's sidebar on a phone (left, 300px at most), or a choice from the bottom edge. In over 240ms on the strong ease-out, out in 180ms; Escape closes it at once."
use_for: "The console's navigation on a phone, and short choices on a phone where a menu would be cramped."
never:
  - "Wide screens for navigation: the sidebar stays open there"
  - "Long forms: give them a page"
source: "conare-web app/assets/css/console2.css (.v2-side and .v2-side-scrim under 768px, .v2-sheet-backdrop), app/layouts/console.vue (the menu button). New in Conare's style: shadcn's drawer."
files:
  - components/ui/Drawer.vue
examples:
  - "Navigation | The console's phone navigation | center"
  - "Bottom | A choice from the bottom edge | center"
---

Drawer shares Sheet's behavior (`useSheet`): a native modal dialog, the exit played before it closes, focus back to
the trigger. The default slot gets `close`.

The body scrolls under a fade (`fade-y`) at the edge with more past it.
