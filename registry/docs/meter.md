---
name: meter
title: Meter
type: registry:ui
group: ui
description: "Progress as a 4px bar with an ink fill (the largest share red), or as one 6px square per step: done in ink, the next in red, the rest an empty hairline. It covers shadcn's progress."
use_for: "Credits left, setup's steps, a share in a table, a job's progress."
never:
  - "Percentages with no label"
  - "A meter for something the person cannot change"
  - "A rounded or striped bar"
source: "conare-web app/assets/css/console2.css (.v2-meter, .v2-setupmeter), app/components/console/SetupMeter.vue"
files:
  - components/ui/Meter.vue
  - components/ui/StepMeter.vue
examples:
  - "Product | In the product"
---
