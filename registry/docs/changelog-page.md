---
name: changelog-page
title: Changelog page
type: registry:block
group: site
description: "What changed, newest first: the head, then each release under a hairline, its date and version on the left, held in view as its notes pass, the title and the notes beside it, and the closing band."
use_for: "A product's changelog."
never:
  - "Marketing copy in a release: say what changed"
  - "Releases without a date"
source: "No changelog page in conare-web (its blog has a Changelog category); laid out as its policy pages (app/components/home/Legal.vue) with DocsBlocks for the notes"
files:
  - components/site/ChangelogPage.vue
examples:
  - "Site | Three releases, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). Each entry's `blocks` takes docs-blocks' blocks; its `id` is the anchor.
