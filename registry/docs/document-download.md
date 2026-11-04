---
name: document-download
title: Document download
type: registry:product
group: product
description: "A document downloads when it is pressed, and what was pressed says so: the row's mark or the button turns to a check for a moment, since the browser's own bar can sit out of sight."
use_for: "Any list or result that holds a document."
never:
  - "Opening a document in a panel"
  - "A download with no answer on the control that started it"
source: "conare-web app/components/console/namespaces/DownloadMark.vue, app/components/console/DownloadButton.vue, app/composables/useDocumentDownload.ts, app/assets/css/console2.css (.v2-docdl, .v2-swap)"
files:
  - components/product/DownloadMark.vue
  - components/product/DownloadButton.vue
  - composables/useDocumentDownload.ts
examples:
  - "Product | In a row and as a button"
---

`useDocumentDownload()` returns `download(id, get, name?)`: `get` returns the document as a Blob or text from your own
API. The mark and the button read the shared state by `id`, so pressing one answers on both.
