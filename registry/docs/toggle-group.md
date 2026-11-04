---
name: toggle-group
title: Toggle group
type: registry:ui
group: ui
description: "Options that stay pressed on the segmented control's track, several at once or one that can be let go."
use_for: "Kinds of document a search returns; an ordering that can be turned off."
never:
  - "Views of one thing (use Tabs)"
  - "Actions (use Button or ButtonGroup)"
source: "conare-web app/assets/css/console2.css (.v2-tabs with aria-pressed)"
files:
  - components/ui/ToggleGroup.vue
examples:
  - "Product | In the product"
---

Tabs' look with `aria-pressed` buttons in a labelled group. `multiple` makes the model an array of values; otherwise it is one value or null, and pressing the pressed one lets it go. With one at most, the white block glides to the pick in 180ms where the browser has anchor positioning. A new file beside Tabs, which stays as it is.
