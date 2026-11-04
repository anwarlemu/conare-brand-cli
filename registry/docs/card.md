---
name: card
title: Card
type: registry:ui
group: ui
description: "A bordered box for one subject: a head with its title and actions over a hairline, then the body. Square, no shadow. Framed adds the website's double rule; a door is a whole card that opens something."
use_for: "A chart, a list, a setting, a way in. The framed card for the one block a page leads with."
never:
  - "A card inside a card"
  - "Shadows"
  - "A clickable div: an interactive card is one link or button (Door)"
source: "conare-web app/assets/css/console2.css (.v2-card, .v2-card-head, .v2-card-framed, .v2-door)"
files:
  - components/ui/Card.vue
  - components/ui/Door.vue
examples:
  - "Product | Cards and doors"
  - "PageOrder | In the order a page uses them"
---
