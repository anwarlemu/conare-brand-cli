---
name: legal-page
title: Legal page
type: registry:block
group: site
description: "A page of policy text: on the left in the double rule, the page's sections, held in view, the one being read on the paper with the red square; beside it the tag, the title, when it was last updated and the text."
use_for: "Terms, privacy, a disclosure policy."
never:
  - "Policy text in capitals beyond what the law asks for"
  - "Sections without ids: the side links lead to them"
source: "conare-web app/components/home/Legal.vue, app/pages/terms.vue"
files:
  - components/site/LegalPage.vue
examples:
  - "Site | Terms, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). Each section's `blocks` takes docs-blocks' blocks; `intro` comes before the first section.
