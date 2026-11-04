---
name: account-menu
title: Account menu
type: registry:ui
group: product
description: "The sidebar's foot: a black square and the email; it opens upward with the credits left, sign-in and security, and Sign out in red."
use_for: "The signed-in person's own settings and signing out, in the Sidebar's foot slot."
never:
  - "The person's name when the email says who it is"
  - "A round avatar: Conare's is square"
source: "conare-web app/components/console/AccountMenu.vue, app/assets/css/console2.css (.v2-trigger, .v2-menu, .v2-meter, .v2-menu-danger)"
files:
  - components/product/AccountMenu.vue
examples:
  - "Product | The account row | center"
---

Put it in `Sidebar`'s `foot` slot (48px). Listen for `open` to fetch the credits the first time it opens, and for
`signOut` to end the session; set `signing-out` meanwhile.
