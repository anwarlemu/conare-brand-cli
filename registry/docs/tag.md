---
name: tag
title: Tag
type: registry:ui
group: ui
description: "A short label for a state or a kind. In the console: ready in a hairline, syncing in black with the dot matrix, failed in the red wash with its square, quiet notes in grey. On the website: 10px capitals on the red."
use_for: "A source's status, an organization's \"default\", an invite's \"invited\"; the website's section labels."
never:
  - "Colour alone: the word carries the state"
  - "Capitals in the console"
  - "A tag as a button"
source: "conare-web app/components/console/Status.vue, app/components/home/Tag.vue, app/assets/css/console2.css (.c-badge)"
files:
  - components/ui/Tag.vue
  - components/ui/StatusTag.vue
  - components/ui/SiteTag.vue
examples:
  - "Product | In the product"
  - "Site | On the site | center"
---
