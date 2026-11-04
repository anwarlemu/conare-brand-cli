---
name: parse-views
title: Parse views
type: registry:block
group: product
description: "A document as Conare read it, three ways: Page beside text (the page and the dark window of what was read, joined by pointing; it ships), Regions (every region numbered with its OCR confidence) and Plain or Conare (a plain reader's text and Conare's, one handle between)."
use_for: "An opened document's reading, and Parse: showing what was read from a page, region by region."
never:
  - "A real customer's document as the sample"
  - "Hiding low OCR confidence: under 80% is marked to check by hand"
source: "conare-web app/components/console/parse/Reading.vue, Sheet.vue, Read.vue, Output.vue, Regions.vue, Plain.vue, app/utils/parse.ts, app/assets/css/console2.css (.v2-parse*)"
files:
  - components/product/ParseReading.vue
  - components/product/ParseSheet.vue
  - components/product/ParseRead.vue
  - components/product/ParseOutput.vue
  - components/product/ParseRegions.vue
  - components/product/ParsePlain.vue
  - composables/useParse.ts
examples:
  - "PageBesideText | Page beside text"
  - "Regions | Regions"
  - "PlainOrConare | Plain or Conare"
---

`ParseReading` takes the reading (`answer`, a `ParseAnswer` from `useParse.ts`: the page's regions with their boxes,
reading order and OCR confidence, its Markdown and what a plain reader gets) and `version` (1, 2 or 3). The page is
drawn from the regions, so the page and the text can't disagree; in an app, put the file's own page image under them.
