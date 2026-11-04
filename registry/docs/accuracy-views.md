---
name: accuracy-views
title: Accuracy views
type: registry:block
group: product
description: "A team's own questions and whether search reached the right page, four ways: Test at work (tiles, the list and a window of a hundred squares; it ships), Verdict first, Two searches and Question sheet. Each question opens to what came back."
use_for: "Showing the result of an accuracy test on the team's own questions, run before a contract and after a change."
never:
  - "Scores a reader has to decode (nDCG, MRR): count questions and name the page each reached"
  - "Hiding Conare's misses: losses stay in, each with its fix"
  - "Every question open at once on a long test"
source: "conare-web app/components/console/accuracy/AtWork.vue, Verdict.vue, Two.vue, Sheet.vue, Detail.vue, app/components/console/RowOpen.vue, Opens.vue, search/PagePreview.vue, app/assets/css/console2.css (.v2-test*, .v2-eval*, .v2-answer, .v2-rowopen, .v2-pg)"
files:
  - components/product/AccuracyAtWork.vue
  - components/product/AccuracyVerdict.vue
  - components/product/AccuracyTwo.vue
  - components/product/AccuracySheet.vue
  - components/product/AccuracyDetail.vue
  - components/product/AccuracyThumb.vue
  - components/product/AccuracyOpens.vue
examples:
  - "TestAtWork | Test at work"
  - "VerdictFirst | Verdict first"
  - "TwoSearches | Two searches"
  - "QuestionSheet | Question sheet"
---

Every view takes the run as `view` (`AccuracyView`, exported from `AccuracyDetail.vue`) and emits `fix`, `search` and
`remove` with the question; the sheet also emits `add`. `AccuracyPanel` (accuracy-page) puts one under Performance's bar.
