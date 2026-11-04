---
name: toast
title: Toast
type: registry:ui
group: ui
description: "A short note at the bottom right saying what just happened: black, for four seconds, three at most. Pointing at one holds them, and a hidden tab stops their time."
use_for: "Confirming something that left the screen: a deleted document."
never:
  - "Errors that need an answer: keep them where they happened"
  - "What the page already shows"
source: "conare-web app/components/console/Toasts.vue, app/composables/useToast.ts, app/assets/css/console2.css (.v2-toast)"
files:
  - components/ui/Toaster.vue
examples:
  - "Product | Delete a document | center"
---
