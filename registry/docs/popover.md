---
name: popover
title: Popover
type: registry:ui
group: ui
description: "Menu's square panel for any content: a few settings, a short form, a note. It grows 4px from its trigger over 200ms and leaves in 120ms, flips to the side with room and stays inside the viewport. Focus moves in; Escape, a press outside or tabbing away closes it."
use_for: "A few settings or a short form that belongs to one button, without leaving the page."
never:
  - "A list of actions: use Menu"
  - "Content someone must read to go on: put it on the page"
  - "A shadow or a rounded corner: the hairline sets it apart"
source: "conare-web app/assets/css/console2.css (.v2-menu: the panel, its 4px drop and 160ms entrance), app/composables/useMenu.ts (Escape, outside press, focus return). New in Conare's style: shadcn's popover."
files:
  - components/ui/Popover.vue
  - components/ui/PopoverPanel.vue
  - composables/usePopover.ts
examples:
  - "Product | Search settings | center"
---

`PopoverPanel` and `usePopover` are what every floating overlay here is drawn with (Tooltip, HoverCard, ContextMenu,
Menubar, DatePicker, Select, Combobox): the panel is portalled to the body (or into the open dialog its trigger sits
in), placed with `position: fixed` beside its anchor or at a point, flipped to the side with room and kept 8px inside
the viewport, and it follows its anchor on scroll and resize. Opened or closed from the keyboard it does not animate.
