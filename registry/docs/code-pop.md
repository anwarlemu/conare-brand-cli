---
name: code-pop
title: Code pop
type: registry:ui
group: ui
description: "Code that opens from a \"Show code\" button: the request behind a result. It opens in place: the code takes its own line under the row, in the dark code window, and pushes what follows."
use_for: "\"Show code\" beside a result: the request that produced it."
never:
  - "Code the person must read to continue: show it on the page"
  - "Long files"
  - "A floating window over the results: it belongs to the row"
source: "conare-web app/components/console/CodePop.vue (version 2, Opens in place), app/components/console/CodeWindow.vue"
files:
  - components/ui/CodePop.vue
examples:
  - "OpensInPlace | Opens in place"
  - "Product | Closed, at the end of the results"
---

Put it in a wrapping flex row (`flex flex-wrap items-center`): the button takes the row's end and the code its own line
under it. `opened` starts it open; `tab` names the code's pill (cURL for a curl command by default).
