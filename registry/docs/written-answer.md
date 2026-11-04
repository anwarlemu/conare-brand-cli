---
name: written-answer
title: Written answer
type: registry:ui
group: product
description: "The written answer above the passages, on the paper with a red edge: the words at 16px citing their sources as small ink squares. Answer first shows it by itself; on request is one button, since it costs a second query; beside the page sets the cited page next to the words."
use_for: "A search that asks for an answer with citations, above Search results."
never:
  - "An answer without its sources"
  - "Holding the passages until the answer is written: they land first"
  - "A spinner: the dot matrix and Writing an answer"
source: "conare-web app/components/console/search/Written.vue, app/assets/css/console2.css (.v2-written, .v2-written-text, .v2-cite, .v2-written-page)"
files:
  - components/product/WrittenAnswer.vue
examples:
  - "AnswerFirst | Answer first"
  - "OnRequest | On request"
  - "BesideThePage | Beside the page"
---
