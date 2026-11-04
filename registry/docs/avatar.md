---
name: avatar
title: Avatar
type: registry:ui
group: ui
description: "Who or what something belongs to, always square: the workspace switcher's 20px hairline tile with an initial, and the account's black square that stands in for a profile picture. A picture crops square and falls back to the initial."
use_for: "Organizations in the switcher, the account at the sidebar's foot, a member in a list."
never:
  - "A round avatar: Conare has no round shapes"
  - "Colored backgrounds per person"
  - "A picture with no name for screen readers"
source: "conare-web app/assets/css/console2.css (.v2-tile), app/components/console/WorkspaceMenu.vue, AccountMenu.vue"
files:
  - components/ui/Avatar.vue
examples:
  - "Product | In the product"
---
