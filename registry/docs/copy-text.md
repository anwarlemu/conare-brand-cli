---
name: copy-text
title: Copy text
type: registry:ui
group: ui
description: "An identifier or an endpoint as typed, in mono, with a quiet button that copies it and shows a check."
use_for: "Key IDs, model names, namespace IDs and endpoints in a definition list or a table cell."
never:
  - "Secrets after they were first shown"
  - "Sentences: copy text holds one value"
  - "A long value without room: it truncates, with the whole value in its title"
source: "conare-web app/components/console/CopyText.vue"
files:
  - components/ui/CopyText.vue
examples:
  - "Product | In the product | center"
---

`value` is what is copied and shown, `label` names it for the button ("copy key id"). The button is the console's: a 20px round hover in the sunken grey, as the branch draws it, the one round shape in the console. Copying uses the library's `useCopy`, which falls back to the copy command where the Clipboard API is refused. For a labelled Copy button use CopyButton.
