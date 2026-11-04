---
name: add-documents
title: Add documents
type: registry:product
group: product
description: "Write first documents from the console: upload files or paste text. A PDF, Word, PowerPoint or Excel file becomes one document whose hits cite their page, slide or sheet."
use_for: "An empty namespace, and adding a few documents by hand."
never:
  - "Large migrations: they go by API"
  - "Uploads with no namespace chosen"
source: "conare-web app/components/console/AddDocuments.vue"
files:
  - components/product/AddDocuments.vue
examples:
  - "Product | Upload or paste"
---

It checks the namespace (`a-z`, `0-9`, `_`, `-`, up to 64) and the files' types, then emits `upload(namespace, files)`
or `paste(namespace, { id, text })`. Write them with your own API, set `writing` while it runs, then `notice` (the form
clears) or `error`. The branch wrote its labels in lowercase; here they are in sentence case.
