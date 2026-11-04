---
name: dialog
title: Dialog
type: registry:ui
group: ui
description: "A native dialog: the title, a close button, the form. Focus stays inside; Escape and the scrim close it. Square, a hairline, no shadow; it rises 8px as it opens."
use_for: "A short form that belongs to the page behind it: invite members, a new organization."
never:
  - "Confirming routine actions: hold the danger button for what removes"
  - "Long flows: give them a page"
source: "conare-web app/components/console/Modal.vue, app/assets/css/main.css (.c-modal)"
files:
  - components/ui/Dialog.vue
examples:
  - "Product | New organization"
---
