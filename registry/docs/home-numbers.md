---
name: home-numbers
title: Home numbers
type: registry:block
group: product
description: "The key numbers on Explorer's first screen, each leading to its page: documents, queries this month, the typical search. Three takes: a strip along the foot, the double rule with this month's bars, or a line under the box with the documents in the title."
use_for: "The first screen of a search page, where the box leads and the numbers stay quiet."
never:
  - "Numbers that don't lead anywhere"
  - "More than three: the box is the page"
source: "conare-web app/components/console/search/Numbers.vue, app/pages/dashboard/search.vue (homenums 1 to 3), app/assets/css/console2.css (.v2-homefoot, .v2-homecards, .v2-homebars, .v2-homeline)"
files:
  - components/product/HomeNumbers.vue
examples:
  - "FootStrip | Foot strip"
  - "DoubleRule | Double rule"
  - "InTheTitle | In the title"
---

`take` picks the layout: `strip`, `rule` or `line`. The documents and this month's queries count up the first time
they show in a session (`count`). The examples set them under Explorer's title (`highlight-text`) and its
`search-box`.
