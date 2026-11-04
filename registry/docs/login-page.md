---
name: login-page
title: Login page
type: registry:ui
group: site
description: "The sign-in page as it ships: the mark over one line while the app forwards to sign-in, or, when sign-in comes back with an error, the reason and the ways on (book a demo, request access, sign in again)."
use_for: "The app's /login route, in front of its own sign-in provider."
never:
  - "A sign-in form of its own: the provider asks for the email"
  - "Forwarding from the component: the app forwards and passes the error"
  - "More than one dark action"
source: "conare-web app/pages/login.vue (example-only item), on the library's Button and PixelButton and the brand mark"
files:
  - components/site/LoginPage.vue
examples:
  - "Site | An email with no invite"
  - "Forwarding | Forwarding | center half"
---

Pass `error` as one of the sign-in callback's codes (`expired`, `cancelled`, `unavailable`, `failed`, `private`) or as
your own words, and the links: `signInHref`, `demoHref` and, for `private`, `requestHref`. Without an error it says
"Taking you to sign in." while the app forwards. `full` fills the window; set it off to place the page in a container.

The shipped page still wears the older console primitives (Inter 600 capitals, 8px corners, the bright red); here it is
drawn in the console's grammar: the Faculty Glyphic title, square controls, the dark pixel button for the one main action.
