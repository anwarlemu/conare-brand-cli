---
name: overview-page
title: Overview page
type: registry:block
group: product
description: "Overview as it ships, a page composition: the setup line, the greeting and how many documents agents search beside the API key's window in the double rule, Queries beside Credits, the largest namespaces. The console's frame and page head come with it."
use_for: "The console's home for a team that is running. Start a console page from ConsoleFrame and ConsolePage."
never:
  - "A search box on the overview: agents search, people check"
  - "More than one dark button: Create API key is the page's one"
  - "Loading as an empty page: rows keep their layout while they load"
source: "conare-web app/components/console/Home.vue (take 7, lead 5), app/components/console/platform/*.vue, app/layouts/console.vue, app/components/console/Page.vue, app/assets/css/platform.css, console2.css (.v2-home-lead, .v2-stats, .v2-meter, .v2-setupline)"
files:
  - components/product/OverviewPage.vue
  - components/product/OverviewQueries.vue
  - components/product/ConsoleFrame.vue
  - components/product/ConsolePage.vue
examples:
  - "Product | Overview, in the console's frame"
---

`ConsoleFrame` is the console's layout: the Sidebar (a drawer under 768px), the TopBar with the trail and the page
under it; `head` takes the workspace switcher and `foot` the account menu. `ConsolePage` is every other page's head:
the title (Faculty Glyphic, or mono for an identifier), its actions on the right, the body in 24px steps.

The greeting is `highlight-text` (its letters settle from faint red to ink, once); the documents line counts up the
first time in a session (`count`); the key window is the website's product window (`VizWindow`, as `step-viz` and the
other viz items use it) over the grain and a sheet of cells (`cell-burst`), playing again every 9 seconds while the
tab shows. `OverviewQueries` draws its charts with `chart`: `BarChart` for queries per day, `LineChart` for the last
24 hours' latency (`latency` is its series, p50 and p95).
