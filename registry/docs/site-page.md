---
name: site-page
title: Site page
type: registry:block
group: site
description: "Every website page's frame: the announcement bar if there is one, the header, the page in main on its own ground, and the footer pinned under it, uncovered as the page scrolls off it."
use_for: "The frame of a website page. The page templates (home-page, pricing-page and the rest) are built on it."
never:
  - "In the console: use ConsoleFrame"
  - "A page without the footer: it is how the site leads on"
  - "A second header inside main"
source: "conare-web app/pages/index.vue, pricing.vue and blog/index.vue (the .home frame: AnnouncementBar, Header, main over the pinned Footer)"
files:
  - components/site/SitePage.vue
examples:
  - "Site | A page in the site's frame"
---

`header` takes SiteHeader's props (`items`, `more`, `links`, `homeHref`, `homeLabel`), `footer` SiteFooter's (`columns`,
`tagline`, `legal`, `legalLinks`) and `announcement` AnnouncementBar's. The `logo` and `actions` slots go to the header;
`actions` renders twice, in the bar and in the phone sheet (`place` says which; in web components put the buttons in
`actions` and again in `sheet-actions`). The page goes in the default slot.
