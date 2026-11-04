---
name: scope-menu
title: Scope menu
type: registry:ui
group: product
description: "Where a search looks: every namespace or one, each with its app's mark and size, a filter once the list is long, arrows and Escape. Its parts are the combobox (a list with a filter) and the select (a listbox on Menu's panel with a check on the pick)."
use_for: "The search box's scope and anywhere a namespace is picked; Combobox for any long list to pick from, Select for a few options in a form."
never:
  - "A native select in the console"
  - "Namespaces without their app's mark"
  - "A filter on a list of six or fewer"
source: "conare-web app/components/console/ScopeMenu.vue, app/components/console/namespaces/Mark.vue, app/assets/css/console2.css (.v2-scope, .v2-menu, .v2-menu-item, .v2-menu-count, .v2-input-icon, .v2-chev)"
files:
  - components/product/ScopeMenu.vue
  - components/ui/Combobox.vue
  - components/ui/Select.vue
examples:
  - "Product | Every namespace or one"
  - "Select | Select | half"
  - "Combobox | Combobox | half"
---

`Combobox` is shadcn's combobox and `Select` its select; both take `options` (`value`, `label`, `hint`, `disabled`,
`pinned`) and v-model. The panel portals to the body (or the open dialog the trigger sits in), flips to the side with
room and stays 8px inside the viewport. Opened from the keyboard it shows at once; Escape returns focus to the trigger.
