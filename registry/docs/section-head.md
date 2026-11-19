---
name: section-head
title: Section head
type: registry:ui
group: site
description: "How the website heads a page or a band: the red tag in the site's capitals, the line in Faculty Glyphic on 1.15 lines, one muted line and the one action under it. Centred, or started at the left beside its content."
use_for: "The head of a website page (as h1) or of a band (as h2) that has no head of its own."
never:
  - "In the console: its pages use ConsolePage"
  - "Two actions in one head"
  - "A tag longer than a word or two"
source: "conare-web app/components/home/Tag.vue, app/pages/pricing.vue and blog/index.vue (the heads), Products.vue and Integrations.vue (the bands' heads)"
files:
  - components/site/SectionHead.vue
examples:
  - "Site | A page's head, with its action"
  - "Start | Beside its content | center half"
---

`as="h1"` for the page's own head; bands default to h2. Put a `button-link` in the `action` slot: the dark one with
`grain`, `pixels` and `arrow` for a page's one main call to action. `titleId` names the heading, so the band around it
can say `aria-labelledby`.
