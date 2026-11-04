---
name: chart
title: Chart
type: registry:ui
group: ui
description: "How Conare draws a number: bars per day under a meter's total and the week's change, lines for series over time, bars for shares of a total, and one split bar for a whole in parts. A 1px grid, axes from 0, and pointing reads a value."
use_for: "Queries per day, search latency, documents written, what a bill is made of. Every series is labeled; the caption says what it counts."
never:
  - "Colour alone to tell series apart: the third line is dashed and every series is in the legend"
  - "Bars that regrow on every hover: they rise once"
  - "Charts without a caption"
  - "An axis that starts above 0"
source: "conare-web app/components/console/BarChart.vue, LineChart.vue, usage/Multiples.vue, usage/Trend.vue, usage/TrendArrow.vue, app/assets/css/console2.css (.c-bar, .v2-chart-week, .v2-splitbar, .v2-segmark, .v2-priced, .v2-rowmark)"
files:
  - components/ui/BarChart.vue
  - components/ui/LineChart.vue
  - components/ui/ChartTrend.vue
  - components/ui/TrendArrow.vue
  - components/ui/SplitBar.vue
examples:
  - "Usage | Bars per day"
  - "Product | Lines over time"
  - "Share | Shares of a total"
  - "Split | A whole in parts"
---
