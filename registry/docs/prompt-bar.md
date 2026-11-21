---
name: prompt-bar
title: Prompt bar
type: registry:ui
group: site
description: "A floating dark glass bar that asks the website: it types its phrases, raises its templates when focused, answers the questions it has answers for in a thread that grows upward, and comes into view once the page scrolls, or from the start when docked."
use_for: "The website's pages and the docs, at the bottom of the window."
never:
  - "Two bars on a page"
  - "Questions it cannot answer without a link onward: every answer ends on its page"
  - "Inside the console"
source: "conare-web app/components/home/PromptBar.vue, app/assets/css/home.css (.prompt-dock, .prompt-glass, .prompt-template, .prompt-go, .prompt-thread, .prompt-word, .prompt-mic)"
files:
  - components/site/PromptBar.vue
examples:
  - "Site | On the site"
---

Pass the `phrases` it types, the `templates` (each with a pixel or Lucide-style `icon`, and an `answer` and `more` link,
or an `href` to open), the `href` its fallback links to, and the `words` it says. It sends nothing anywhere: it emits
`ask` with each question and opens links in a new tab. `shortcuts` shows the key and focuses the bar with Cmd+K or
Cmd+I; `docked` shows it from the start; `voice` adds a mic that dictates with the browser's own speech recognition,
only where the browser has it.

It rises in over 280ms on the strong ease-out and leaves in 200ms; the templates settle up 40ms apart, the thread opens
on grid rows over 160ms and the answer's words fade up 22ms apart. The suggestion's arrow opens out beside its label
without moving. Reduced motion keeps colour and opacity only, and the placeholder stops typing.

The thread scrolls under a fade (`fade-y`) at the edge with more past it.
