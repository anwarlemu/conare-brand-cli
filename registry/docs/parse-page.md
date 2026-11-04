---
name: parse-page
title: Parse page
type: registry:block
group: product
description: "Parse as a page: files to try and your own (pressed or dropped), the reading beside the page, then what comes next: add it to a namespace, copy the Markdown, or open the API call in place."
use_for: "Trying Parse on a file, and showing a prospect what Conare reads that a plain PDF reader doesn't."
never:
  - "Storing the file without asking: Parse stores nothing until it is added to a namespace"
  - "Claiming a person's own file was read when the reading is a sample"
source: "conare-web app/pages/dashboard/parse.vue, app/assets/css/console2.css (.v2-parsefiles, .v2-parsefile, .v2-parsenext)"
files:
  - components/product/ParsePage.vue
examples:
  - "Product | Parse in the console"
---

`ParsePage` takes the files to try (`samples`), the picked one (`v-model:chosen`), the `answer` and whether it is
`reading`; it emits `file` for a file pressed or dropped and `add` with the namespace picked. `namespaces` (name and
size) fill the `scope-menu` that picks where the file goes; `curl` opens under API call (`code-pop`). Put it in a
`ConsolePage` titled Parse.
