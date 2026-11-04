---
name: copy-button
title: Copy button
type: registry:ui
group: ui
description: "The copy button beside a value: the label swaps from Copy to Copied in place, the width of the longer word, so nothing moves, and the check draws its stroke."
use_for: "Copying a secret or an endpoint next to it."
never:
  - "Lowercase labels"
  - "A copy button whose width changes when it says Copied"
source: "conare-web app/components/console/Copy.vue (version 2, Copy to Copied)"
files:
  - components/ui/CopyButton.vue
examples:
  - "Key | Beside a new key | center half"
  - "Endpoint | Beside an endpoint | center half"
---
