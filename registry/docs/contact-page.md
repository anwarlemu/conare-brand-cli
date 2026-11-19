---
name: contact-page
title: Contact page
type: registry:block
group: site
description: "Contact: the head, the ways to reach the team on the left, the form on the right in the double rule with its one dark button. It calls nothing: it emits submit, and shows what happens next once the app says it is sent."
use_for: "A website's contact page."
never:
  - "Calling the API from the component: it emits submit"
  - "More than four fields"
source: "No contact page in conare-web; set from its request-access page (app/pages/request-access.vue: the fields, the dark send button, what happens next) and the website's double rule"
files:
  - components/site/ContactPage.vue
examples:
  - "Site | Contact, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). Wire `submit` (the answers: name, email, company, message) to your own endpoint, set `sending` while it runs and `sent` when it is done, or `error` with the server's words.
