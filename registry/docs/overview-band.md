---
name: overview-band
title: Overview band
type: registry:ui
group: product
description: "What Conare is doing for a team, in one band above the numbers: the pipeline's four steps with its numbers, three questions a buyer asks answered in a sentence each, or the dark live panel with the last searches landing."
use_for: "The top of Home or an overview, answering \"is it working?\"."
never:
  - "More than one band on a page"
  - "Red for anything but the step or answer that broke"
  - "A live log that keeps scrolling: the last six land once and hold"
source: "conare-web app/components/console/overview/Band.vue, app/assets/css/console2.css (.v2-pipeline, .v2-questionrow, .v2-liveband, .v2-livelog, .v2-logdot)"
files:
  - components/product/OverviewBand.vue
examples:
  - "Pipeline | Pipeline"
  - "ThreeQuestions | Three questions"
  - "Live | Live"
---
