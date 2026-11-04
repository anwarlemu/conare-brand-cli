---
name: calendar
title: Calendar
type: registry:ui
group: ui
description: "A month to pick a day from: square 32px day cells, the picked day in ink, Menu's red square marking today, 12px muted weekday heads and ghost arrow buttons. Arrows, Home, End and Page Up or Down move; Enter picks."
use_for: "Picking a day on the page: a report's start, a key's expiry. In a field, use DatePicker."
never:
  - "Rounded day cells or a colored selection: the pick is ink"
  - "Animating the month change"
  - "Typing a known date: a text field is faster"
source: "conare-web app/assets/css/console2.css (.v2-menu-item's red marker, .v2-btn-ghost, the type scale). New in Conare's style: shadcn's calendar."
files:
  - components/ui/Calendar.vue
examples:
  - "Product | Report start | center"
---
