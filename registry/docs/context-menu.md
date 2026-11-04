---
name: context-menu
title: Context menu
type: registry:ui
group: ui
description: "Menu's square panel and rows opened where the pointer right-clicks, or under the focused row with Shift+F10 or the menu key. Arrows, Home, End and Escape are handled; focus returns to what was clicked."
use_for: "Shortcuts for a row in a dense list (open, copy an ID, download, delete), alongside a visible way to do the same."
never:
  - "The only way to an action: right-clicks are hidden; keep a Menu or a button in the row"
  - "Destructive actions that don't confirm: hold them where they are, or confirm with AlertDialog"
source: "conare-web app/assets/css/console2.css (.v2-menu, .v2-menu-item), app/composables/useMenu.ts. New in Conare's style: shadcn's context menu, on Menu's rows opened at the pointer."
files:
  - components/ui/ContextMenu.vue
examples:
  - "Product | A namespace's documents"
---

Put `data-context="<id>"` on each row; `open` emits the id of the row that was clicked, so one menu serves the list.
