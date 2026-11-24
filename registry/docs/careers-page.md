---
name: careers-page
title: Careers page
type: registry:block
group: site
description: "The open roles, a row each in the double rule (the name, the team and the place, the whole row a link), or a line when there are none, in the site's frame."
use_for: "The website's careers or jobs page."
never:
  - "Photos of real people"
  - "Perks lists in place of the roles"
source: "No careers page in conare-web; set from its 404 cells (the double rule rows that take the paper) and the pages' heads"
files:
  - components/site/CareersPage.vue
examples:
  - "Site | Careers, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). `roles` are `{ title, team?, place?, href }`; `empty` shows when there are none.
