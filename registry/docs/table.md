---
name: table
title: Table
type: registry:ui
group: ui
description: "Rows of one kind of thing: a paper head in sentence case, 40px rows, numbers in tabular figures, IDs in mono, and a status column of tags. Settings and the audit log share one plainer table with buttons one width."
use_for: "Namespaces, sources, keys, members, the audit log."
never:
  - "A table for one subject with a chart (use Card)"
  - "Capitals in heads"
  - "A scroll box a keyboard can't reach"
source: "conare-web app/assets/css/console2.css (.v2-table, .c-table), app/assets/css/main.css (.c-table)"
files:
  - components/ui/Table.vue
examples:
  - "Product | Rows that open"
  - "Settings | In settings"
---

Framed, the rows scroll sideways under a fade (`fade-x`); the hairline frame stays whole.
