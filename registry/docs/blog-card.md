---
name: blog-card
title: Blog card
type: registry:ui
group: site
description: "A post as a card: in its own ruled box that takes the paper under the pointer, a picture of cells on the grained dark panel with the category in red, then the title, its line, and who it is from and the date in ruled tags. A window can play in the picture once the card is on screen."
use_for: "The blog's list and \"More posts\" under an article."
never:
  - "Stock photos"
  - "Titles over two lines"
  - "A window that replays on hover: it plays once"
source: "conare-web app/components/home/BlogCard.vue, app/assets/css/home.css (.blog-card, .footer-grain)"
files:
  - components/site/BlogCard.vue
examples:
  - "Site | On the site"
---

The `window` slot gets `active` once the card is on screen. The website puts a benchmark's leaderboard there: an
`eval-viz` with `:limit="3"`, stretched to the 520 by 380 box and scaled with the card.
