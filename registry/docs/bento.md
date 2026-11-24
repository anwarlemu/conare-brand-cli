---
name: bento
title: Bento
type: registry:block
group: site
description: "What a product does as cells of different sizes in the double rule: large, wide, tall or plain, each led by a red pixel pattern."
use_for: "A features band where one or two things lead and the rest support them."
never:
  - "Pictures stretched to fill a cell"
  - "More than one large cell in a row"
source: "No bento in conare-web; set from its feature grid (home.css Products cells, the hero tabs' pixel patterns) with spans on the same hairline grid"
files:
  - components/site/Bento.vue
examples:
  - "Site | Bento, on sample data"
---

Each cell is `{ title, body, size? }`; `size` is `large` (two columns and two rows), `wide` (two columns) or `tall` (two rows). The grid packs densely, so order the cells by importance.
