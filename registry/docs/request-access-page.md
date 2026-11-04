---
name: request-access-page
title: Request access page
type: registry:ui
group: site
description: "The request-access page as it ships: the mark, the title and one line, then the part for where the person is: sign in first, try again, the form (work email, name, company, team size, what they want to build) or what happens next."
use_for: "Where sign-in sends someone it does not admit: no invite, outside the open sign-up domains."
never:
  - "Calling the API from the component: it emits submit, retry and edit"
  - "Asking for an email the person did not sign in with"
  - "A personal address taken for a company without saying so"
source: "conare-web app/pages/request-access.vue (example-only item), on the library's Field, Input, Button and PixelButton and the brand mark"
files:
  - components/site/RequestAccessPage.vue
examples:
  - "Site | On the site"
---

`state` is the app's: `loading` (its line appears only after 300ms), `signed-out`, `failed`, `form` or `sent`. Pass the
requester's `email`, `personalEmail` and `name`, the `teamSizes` to choose from, `sending` and `error` while it posts,
and the links. `submit` carries `{ name, company, teamSize, useCase }`; `retry` asks the app to load again and `edit`
to reopen the form.

The shipped page wears the older console primitives (Inter 600 capitals, 8px corners, lowercase button labels, cards with
no inset); here it is drawn in the console's grammar with sentence-case labels and the card's 16px inset. The team size
is a NativeSelect and the use case a Textarea, each in a Field.
