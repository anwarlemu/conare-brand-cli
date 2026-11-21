---
name: docs-blocks
title: Docs blocks
type: registry:ui
group: site
description: "A docs page's body block by block: paragraphs, headings, lists led by a red square, callouts (a warning on the wash), ruled tables under a paper head, the code window, an endpoint's fields with nested ones behind a toggle, and link cards in the double rule whose pixel pattern turns red."
use_for: "Docs pages and guides written as data (one block per paragraph, list, table or sample)."
never:
  - "Prose set in mono"
  - "A callout for every paragraph"
  - "Headings past two levels"
source: "conare-web app/components/docs/Blocks.vue, Inline.vue, Fields.vue, Table.vue, Code.vue, app/content/patterns.ts, app/assets/css/docs.css (example-only item docs-blocks)"
files:
  - components/site/DocsBlocks.vue
  - components/site/DocsInline.vue
  - components/site/DocsFields.vue
  - components/site/DocsTable.vue
examples:
  - "Site | On the site"
---

A wide table scrolls sideways under a fade (`fade-x`); its frame stays whole.
