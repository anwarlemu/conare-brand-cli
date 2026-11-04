---
name: step-viz
title: Step window
type: registry:ui
group: visuals
description: "How it works' window: one search shown step by step as an agent window, from the ask to what changed, with a shimmering status, records as chips, the dot matrix and a ticking timer; picking a step crossfades what is in it."
use_for: "How it works and the docs' introduction (`step` 0 to 3; `runs` replays the picked one)."
never:
  - "Steps that do not happen in the product"
  - "Running while off screen: set `active` only while it is in view"
source: "conare-web app/components/home/StepViz.vue, app/assets/css/home.css (.viz-*, .step-body, .step-swap)"
files:
  - components/visuals/StepViz.vue
examples:
  - "Site | On the site"
---
