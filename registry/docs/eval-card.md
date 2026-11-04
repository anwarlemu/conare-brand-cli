---
name: eval-card
title: Eval card
type: registry:ui
group: site
description: "A benchmark as a card: its name, our score and rank, the top five as bars with ours in red (kept in when it ranks lower), and the way to its page. The paper comes in under the pointer."
use_for: "The evals page and a model's page."
never:
  - "A score without its metric and rank"
  - "More than one red bar"
  - "Bars that don't start at 0"
source: "conare-web app/components/home/EvalCard.vue, app/content/evals.ts (topRows, rankLabel, formatScore), app/assets/css/home.css (.eval-card)"
files:
  - components/site/EvalCard.vue
examples:
  - "Site | On the site"
---
