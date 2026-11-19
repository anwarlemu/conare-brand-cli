---
name: home-page
title: Home page
type: registry:block
group: site
description: "The website's home: the hero with the one dark call to action and the window in the red frame, who connects (logo strip), what it does (feature grid), one customer's words, the questions and the closing red band, in the site's frame."
use_for: "The home page of a website."
never:
  - "A second dark call to action above the closing band"
  - "Red past about 10% of the first screen"
source: "conare-web app/pages/index.vue (the order of the bands), app/components/home/*.vue"
files:
  - components/site/HomePage.vue
examples:
  - "Site | The home, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). The `window` slot is the hero's window: draw it on `VizWindow`, as the hero's example does. Every band takes its own props (`hero`, `logos`, `features`, `testimonial`, `faq`, `cta`), so leave out what a page does not have by building your own page from the same items.
