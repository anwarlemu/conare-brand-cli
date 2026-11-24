---
name: comparison-table
title: Comparison table
type: registry:block
group: site
description: "What each plan includes, side by side: a row per thing, a column per plan, the red square for included and a hairline for not, in the double rule."
use_for: "Comparing plans or editions under a pricing table."
never:
  - "Green ticks or red crosses"
  - "Colors that carry the meaning alone"
source: "No comparison table in conare-web; set from its pricing cards (pricing.vue: the rule, the plan names in Faculty Glyphic, the red square marker)"
files:
  - components/site/ComparisonTable.vue
examples:
  - "Site | Comparison, on sample data"
---

`rows` are `{ feature, values }` with a value per plan: `true`, `false` or a few words. Included and not are said aloud (`included`, `excluded`). On phones it scrolls sideways and fades at its edges.
