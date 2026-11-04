---
name: sheet
title: Sheet
type: registry:ui
group: ui
description: "A panel at the right edge over a dimmed page, the console's docs panel: 420px, a hairline edge, the 48px bar with the title and a close button. It slides 16px in over 220ms and leaves in 160ms; Escape closes it at once and focus returns."
use_for: "Reading or editing something beside the page without leaving it: docs, a document's details, a source's settings."
never:
  - "A short question or a confirmation: use Dialog or AlertDialog"
  - "Navigation on a phone: use Drawer"
  - "A shadow: the hairline edge and the scrim set it apart"
source: "conare-web app/assets/css/console2.css (.v2-docs, .v2-docs-bar, .v2-docs-body and their transitions; .v2-sheet-backdrop for the scrim). New in Conare's style: shadcn's sheet."
files:
  - components/ui/Sheet.vue
  - composables/useSheet.ts
examples:
  - "Product | Docs beside the page | center"
---

`useSheet` is the slide-in behavior Sheet and Drawer share: a native modal dialog (focus stays inside, the page is
inert), the exit played before the dialog closes, Escape at once, focus back to the trigger.
