---
name: pricing-page
title: Pricing page
type: registry:block
group: site
description: "Pricing: the head with the one dark call to action, each group of prices (pricing table), Enterprise as the page's one red block with what its terms cover, the questions and the closing band."
use_for: "A website's pricing page."
never:
  - "A second red block: Enterprise is the one"
  - "Prices hidden behind a contact form, except Enterprise"
source: "conare-web app/pages/pricing.vue, app/content/pricing.ts"
files:
  - components/site/PricingPage.vue
examples:
  - "Site | Pricing, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). Each of `groups` is one `pricing-table`; its `key` is the anchor. Leave out `enterprise` and the red block goes with it.
