---
name: tabs
title: Tabs
type: registry:ui
group: ui
description: "A few views of one thing: line tabs for a page's sections (an ink underline and a red square on the current one) and the segmented control for a chart's view or range, its white block gliding to the pick."
use_for: "Documents and Settings on a namespace; Volume and Latency on a chart; 1h, 24h and 7d."
never:
  - "Actions (use Button)"
  - "More than six views (use Menu)"
  - "Bold on the current tab: the underline marks it"
source: "conare-web app/assets/css/console2.css (.v2-tabline, .v2-tabs)"
files:
  - components/ui/Tabs.vue
  - components/ui/LineTabs.vue
examples:
  - "Line | Line tabs"
  - "Product | Segmented control"
---
