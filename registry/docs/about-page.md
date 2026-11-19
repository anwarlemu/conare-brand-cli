---
name: about-page
title: About page
type: registry:block
group: site
description: "About the company: the head, the story in one narrow column, the numbers in the double rule, what the team holds to (feature grid) and the closing band, in the site's frame."
use_for: "A website's about page."
never:
  - "Team photos or names on the page: keep it about the company"
  - "Numbers without what they count"
source: "No about page in conare-web; set from its pages: the head (pricing.vue), the text column (blog/[slug].vue with DocsBlocks), the price cards' large figures (pricing.vue), the bands (home/*.vue)"
files:
  - components/site/AboutPage.vue
examples:
  - "Site | About, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). `story` takes docs-blocks' blocks (paragraphs, headings, lists).
