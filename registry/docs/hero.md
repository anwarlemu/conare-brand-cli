---
name: hero
title: Hero
type: registry:ui
group: site
description: "The home's first band: the eyebrow tag, the headline in Faculty Glyphic with its red stop and letter reveal, one line and one action settling up in turn, then the red frame (the room grid, the burst and the grain in a triple rule) with the window in front and the teams as stepped tabs on its top, taking turns on a timer."
use_for: "The top of the home page."
never:
  - "More than one hero on a page"
  - "Red past about 10% of the first screen"
  - "A timer that runs off screen or for reduced motion"
source: "conare-web app/components/home/Hero.vue, UseCases.vue (the frame and the team tabs), app/assets/css/home.css (.settle, .hero-frame, .uc-shell, .uc-frame, .uc-px-tab, .uc-fill)"
files:
  - components/site/Hero.vue
examples:
  - "Site | On the site"
---

The headline is `highlight-text`: its letters wait faint and red, then settle to ink once, as the band comes on
screen (a `title` slot replaces it with plain markup). Put a `button-link` in the `action` slot: the dark one with
`grain`, `pixels` and `arrow`, as the website has it. The `window` slot takes what each team asks; the example draws it
on `VizWindow`, the website's product window, re-keying its body on each turn so its parts rise again.
