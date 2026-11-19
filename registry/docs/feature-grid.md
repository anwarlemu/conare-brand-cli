---
name: feature-grid
title: Feature grid
type: registry:ui
group: site
description: "What a product does, a card per feature in the website's double rule: a red pixel pattern, the name in Faculty Glyphic and its line. One across on phones, two from 640px, three from 1024px."
use_for: "The band on a home or product page that says what it does, three to six things."
never:
  - "More than six features: say the six that matter"
  - "Icons from an icon set: the marks are the hero tabs' pixel patterns"
  - "A feature without its line"
source: "conare-web app/pages/pricing.vue (the Enterprise cards: off-white in the double rule, led by a pattern), app/components/home/Products.vue (the grid's double rule), app/content/patterns.ts"
files:
  - components/site/FeatureGrid.vue
examples:
  - "Site | Six features"
---

The marks take the hero tabs' four pixel patterns in turn. An odd last card on two columns takes the whole row.
