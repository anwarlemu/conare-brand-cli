---
name: searches-page
title: Searches page
type: registry:block
group: product
description: "Searches as it ships, a page composition: every search an agent ran, newest first, with the page's one filter in its head. A row opens in place to what the agent read, its documents to download, and why a search went wrong with what to do about it."
use_for: "Checking what search handed an agent, and finding the searches to fix."
never:
  - "A second filter: the outcome is the page's one"
  - "Opening a search in a panel: it opens under its row"
  - "Every row at once on a long log: twelve, then twelve more"
source: "conare-web app/pages/dashboard/searches.vue, app/components/console/searches/Log.vue, Simple.vue, Outcome.vue, Acts.vue, utils/searchLog.ts, app/assets/css/console2.css (.v2-table, .v2-rowgrow, .v2-logsimple, .v2-chev, .v2-more)"
files:
  - components/product/SearchesPage.vue
  - components/product/SearchesLog.vue
examples:
  - "Product | Searches, in the console's frame"
---

`SearchesLog` is the table alone (rows with `question`, `agent`, `outcome`, `tookMs`, `when`, `passages`, and a `why`
and `fix` when a search went wrong); `SearchesPage` puts it under the page head with the filter (`v-model:show`) and
the empty state. The branch's other two takes (Trace, the list beside one search; Most asked, questions counted once)
are not ported.
