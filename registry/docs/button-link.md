---
name: button-link
title: Button link
type: registry:ui
group: site
description: "The website's button: a square link, 36px with a 13px label (28px and 12px small), whose hover is a fill of 6px squares coming in from the left; dark with the pixel arrow for the main call to action, outlined for the rest, red, and light and ghost on dark bands."
use_for: "Calls to action on the website: Book a demo, Read the docs, Contact us. A link, never a form button."
never:
  - "Inside the console (use Button or PixelButton)"
  - "A change of size or weight on hover: the fill is the hover"
  - "Two red buttons in one band"
  - "An arrow that moves on hover: the pixel arrow stays still"
source: "conare-web app/components/home/ButtonLink.vue, app/assets/css/home.css (.btn-px, .btn-label, .btn-arrow, .btn-grain)"
files:
  - components/site/ButtonLink.vue
examples:
  - "Site | On the site"
  - "Dark | Dark | center half"
  - "Outlined | Outlined | center half"
  - "Small | Small | center half"
  - "Red | Red | center half"
  - "Light | Light, on a dark band | center half"
  - "Ghost | Ghost, on a dark band | center half"
---

`variant` is `red` (the default, the flat red block whose squares come in black), `secondary` (outlined, its border
turning red as red squares come in), `light` (off-white on a dark band) or `ghost` (outlined on a dark band). `pixels`
makes the dark main call to action, black with red squares, and `arrow` adds the pixel arrow: lit squares on a 5 by 5
of dim ones. On the website the arrow steps one grid to the right on hover; here it stays still, as icons never move on
hover. Where the label changes colour over the fill (secondary and light), each column of squares carries its own
off-white copy of the label, so the label turns as the squares land. `grain` lays the footer's grain under the label.

The squares come in over 80ms each on a decelerating curve with a delay along the button (about half a second end to
end) and leave over 120ms, a touch quicker. A press lights them at once. Reduced motion drops the delays, so the fill
fades in as one.
