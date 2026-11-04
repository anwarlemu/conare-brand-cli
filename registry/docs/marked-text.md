---
name: marked-text
title: Marked text
type: registry:ui
group: ui
description: "A passage with the query's words in medium weight and ink, so the reader sees why it matched."
use_for: "Search results and passages shown for a query."
never:
  - "Red or highlighted fills for matches"
  - "Marking words in text that was not searched"
source: "conare-web app/components/console/Marked.vue, app/utils/marks.ts"
files:
  - components/ui/MarkedText.vue
examples:
  - "Product | In the product"
---

Words of four letters or more in `query` are marked wherever they appear in `text`, ignoring case. Set the passage in the soft grey so the marked words in ink stand out. Each word carries its place as `--w` for a reveal that plays it in reading order.
