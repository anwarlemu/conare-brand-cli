---
name: accuracy-page
title: Accuracy page
type: registry:block
group: product
description: "Accuracy as it ships: Performance's second view, its bar with the two views and the test's actions (Add questions opening in place, Copy link, Run again as the one dark button), then the Test at work view."
use_for: "The console's Performance page, Accuracy tab: a team's own test, run now and then."
never:
  - "A page of its own in the sidebar: it runs now and then, so it sits under Performance"
  - "A second dark button: Run again is the page's one"
source: "conare-web app/components/console/accuracy/Panel.vue, Add.vue, app/components/console/performance/Tabs.vue, app/pages/dashboard/performance.vue (the branch's accuracy page redirects there)"
files:
  - components/product/AccuracyPanel.vue
  - components/product/AccuracyAdd.vue
examples:
  - "Product | Accuracy in the console"
---

`AccuracyPanel` takes the run (`view`), `version` (4, Test at work, by default), the link Copy link copies and the
questions agents ask most (`asked`); it emits `run`, `add`, `fix`, `search`, `remove` and `update:tab`. Put it in a
`ConsolePage` titled Performance.
