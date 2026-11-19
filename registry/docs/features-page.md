---
name: features-page
title: Features page
type: registry:block
group: site
description: "A product's page: the head with the one dark call to action, what it does (feature grid), what it connects to (logo strip), one customer's words and the closing band, in the site's frame."
use_for: "A page per product or feature set."
never:
  - "More than one feature grid: one page, one product"
  - "A second dark call to action above the closing band"
source: "conare-web app/pages/reranker.vue and pricing.vue (a page's head and bands), app/components/home/Products.vue, Integrations.vue"
files:
  - components/site/FeaturesPage.vue
examples:
  - "Site | A product page, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components).
