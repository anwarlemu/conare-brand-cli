---
name: accordion
title: Accordion
type: registry:ui
group: ui
description: "Rows that open in place, in Conare's style: hairlines between them, a 12px chevron that turns as one opens, the answer opening over 260ms and closing in 180ms with its words settling down a beat after. One open at a time unless multiple."
use_for: "Details most readers skip: limits, retention, a setup checklist. The website's questions use FAQ."
never:
  - "A whole page's content behind rows"
  - "A row that opens on hover"
  - "Nesting one accordion in another"
source: "conare-web app/assets/css/console2.css (.v2-collapse), app/assets/css/main.css (.c-details), app/components/home/Faq.vue (the phone accordion)"
files:
  - components/ui/Accordion.vue
  - components/ui/AccordionItem.vue
examples:
  - "Product | In the product"
  - "Multiple | Several open"
---
