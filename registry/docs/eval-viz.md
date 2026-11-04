---
name: eval-viz
title: Eval window
type: registry:ui
group: visuals
description: "One benchmark as a window: what it measures, the model's score and rank, then the leaderboard's rows entering in turn and their bars growing, the model's own row in red, and the benchmark's disclosure under them. VizWindow is the frame every product window shares."
use_for: "Benchmarks and how it works on the website, while the band is on screen. `items`, `pick` and `runs` make it one window for several results that crossfades between them."
never:
  - "Running while off screen: set `active` only while it is in view"
  - "Inside the console"
  - "Figures without their source"
source: "conare-web app/components/home/EvalViz.vue, app/content/evals.ts, app/assets/css/home.css (.viz-*, .step-body, .step-swap)"
files:
  - components/visuals/EvalViz.vue
  - components/visuals/VizWindow.vue
examples:
  - "Site | On the site"
---
