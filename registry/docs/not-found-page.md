---
name: not-found-page
title: Not found page
type: registry:block
group: site
description: "The page for an address that leads nowhere: the code in the tag, one line on what happened, the one dark way home, then where people usually meant to go, in the site's frame."
use_for: "The website's 404 page."
never:
  - "A joke in place of the way home"
  - "A page without the header and footer"
source: "No 404 page in conare-web; set from its pages' heads (pricing.vue), the dark button link and the double rule"
files:
  - components/site/NotFoundPage.vue
examples:
  - "Site | Not found, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components).
