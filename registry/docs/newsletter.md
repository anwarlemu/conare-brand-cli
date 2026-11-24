---
name: newsletter
title: Newsletter
type: registry:block
group: site
description: "A sign-up for news by email: the band's head, one email field and the one dark button in the double rule; the app sends it and says what follows."
use_for: "A newsletter or updates sign-up on a marketing page."
never:
  - "A second button or a checkbox wall"
  - "Asking for more than the email"
source: "No newsletter in conare-web; set from its contact form (the field, the pixel button and the double rule) and the pages' heads"
files:
  - components/site/Newsletter.vue
examples:
  - "Site | Newsletter, on sample data"
---

`submit` carries the address (`onSubmit` in React). `sent` shows `sent-text` in place of the form; `error` shows the server's answer under it.
