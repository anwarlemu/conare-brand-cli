---
name: search-results
title: Search results
type: registry:ui
group: product
description: "Best match in its card with the written answer or the passage, the pages around it and its source; then the other matches as quiet lines, each opening in place to its passage. The query's words are in medium weight."
use_for: "A person checking what Conare finds, from Home, the sidebar or a namespace."
never:
  - "A results page that leaves for another page to read a passage: lines open in place"
  - "Colour alone for the query's words: they are medium weight in ink"
  - "Scores without two decimals"
source: "conare-web app/components/console/search/BestMatch.vue, Answer.vue, PagePreview.vue, app/components/console/Marked.vue, app/utils/marks.ts, app/assets/css/console2.css (.v2-rise, .v2-others, .v2-match, .v2-expand, .v2-pg, .v2-cite, [data-flash])"
files:
  - components/product/SearchResults.vue
  - components/product/AnswerText.vue
  - components/product/MarkedPassage.vue
  - components/product/PagePreview.vue
examples:
  - "Product | In the product"
---
