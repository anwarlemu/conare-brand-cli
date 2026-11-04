---
name: alert-dialog
title: Alert dialog
type: registry:ui
group: ui
description: "A question that must be answered first, on Dialog's window: the title, one line saying what happens, Cancel and the danger action. Focus starts on Cancel; the scrim does nothing; Escape cancels."
use_for: "Confirming what can't be undone and reaches past one row: deleting a namespace, an organization, every key."
never:
  - "Confirming a row's delete or revoke: hold the danger button (HoldButton), as the console does"
  - "Routine actions, or more than one line of explanation"
  - "Two danger buttons, or a dark button beside the danger one"
source: "conare-web app/components/console/Modal.vue, app/assets/css/main.css (.c-modal), console2.css (.v2-btn-danger). New in Conare's style: shadcn's alert dialog."
files:
  - components/ui/AlertDialog.vue
examples:
  - "Product | Delete a namespace | center"
---
