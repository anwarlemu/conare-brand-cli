---
name: highlight-text
title: Highlight text
type: registry:ui
group: visuals
description: "The headline reveal: each letter starts faint and red, fades up, then settles to ink, spreading from the centre or the start; trailing characters stay red."
use_for: "The website hero and section titles; the console's greeting and search headline, once per session."
never:
  - "On a screen opened many times a day, every time"
  - "Body text"
  - "More than one on a screen"
source: "conare-web app/components/home/HighlightText.vue, app/assets/css/home.css and console2.css (.hl, .hl-char, .hl-word)"
files:
  - components/visuals/HighlightText.vue
examples:
  - "Site | On the site | center"
  - "Product | In the product | center"
---

`as` picks the heading level, `text` the words and `accent` the trailing characters that stay red (the hero's full stop). Letters wait at 20% in red, fade up over 200ms, then settle to the heading's colour over 400ms; lines start 100ms apart and letters 40ms apart from the centre (from the start on left-aligned text). It plays once, when the heading comes on screen. The words are read once by screen readers. Without JavaScript and with reduced motion the text just shows. The two curves and the 400ms step are tokens of their own (`--ds-easing-reveal-fade`, `--ds-easing-reveal-ink`, `--ds-duration-reveal`).
