---
name: list-detail-page
title: List and detail page
type: registry:block
group: product
description: "A list and the page of one thing in it: the list with a filter and the one dark button, each row opening its thing; the thing's page with its name in mono, a way back, its facts and what it holds in a flush card."
use_for: "Namespaces, sources, keys: any list whose rows open a page of their own."
never:
  - "Opening a row in a dialog: it opens as its own page"
  - "More than one dark button in a view"
  - "Loading as an empty page: rows keep their layout while they load"
source: "conare-web app/pages/dashboard/namespaces/index.vue and [namespace].vue, app/components/console/namespaces/Table.vue"
files:
  - components/product/ListDetailPage.vue
examples:
  - "Product | Namespaces, in the console's frame"
---

`v-model:open` is the open row's `name`, empty for the list: route it to your own addresses if each thing has one.
`noun` names the things (namespace by default) in the filter, the back button and the dark button.
