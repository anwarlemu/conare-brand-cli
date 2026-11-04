---
name: source-row
title: Source row
type: registry:product
group: product
description: "A source as getting started lists it: its app's mark and name, linking to the source, then its sync's state as a tag, and with detail its last and next sync."
use_for: "Lists of sources: getting started, a namespace's sources, a sidebar note."
never:
  - "A source without its app's mark"
  - "Red for anything but a failed sync"
source: "conare-web app/components/console/Source.vue, app/assets/css/console2.css (.c-badge under .cv2)"
files:
  - components/product/SourceRow.vue
  - components/product/AppMark.vue
examples:
  - "Product | Getting started's sources"
---

`AppMark` draws an app's logo when you pass `logo`, otherwise a square tile with its initial; the library ships no
third-party logos. Word `synced` and `next` in the reader's terms ("2 hours ago").
