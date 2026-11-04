---
name: typography
title: Typography
type: registry:ui
group: ui
description: "The console's type as one reference: a 20px Faculty Glyphic page title, Geist at 13px for everything else, 12px meta, 11px captions, Geist Mono for keys and IDs, a link with a quiet underline and a query's words in medium weight."
use_for: "Any text in the console. Prefer the type-* utilities in markup; Text is the same set as a component."
never:
  - "Bold (600 and up) weights"
  - "Capitals in the console"
  - "Text lighter than the meta gray"
  - "A marked word with a fill: weight only"
source: "conare-web app/assets/css/main.css (@theme), app/assets/css/console2.css (.v2-title, .v2-meta, .v2-mono, .v2-link), app/components/console/Marked.vue"
files:
  - components/ui/Text.vue
examples:
  - "Product | The console's type"
---
