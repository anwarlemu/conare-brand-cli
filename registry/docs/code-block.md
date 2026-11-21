---
name: code-block
title: Code block
type: registry:ui
group: ui
description: "Code to read and copy, in one dark window on the site and in the product: a pill for each request or language and Copy on one row, a rule, then the code. There is always at least one pill."
use_for: "Requests, commands and configuration the person copies into their own tools."
never:
  - "Code shortened with a fade or a \"show more\": show what they copy in full"
  - "Prose set in mono"
  - "A window with no pill: name the code, such as cURL, CSS or JSON"
source: "conare-web app/components/console/CodeWindow.vue, CodeCopy.vue, app/assets/css/code-window.css"
files:
  - components/ui/CodeBlock.vue
  - components/ui/CodeCopy.vue
examples:
  - "Product | A pill per language"
  - "Single | One command"
---

A long line scrolls sideways under a fade (`fade-x`) at the edge with more past it.
