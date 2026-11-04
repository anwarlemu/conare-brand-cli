---
name: credit-history
title: Credit history
type: registry:product
group: product
description: "Every time credits were added, newest first. A team can add credits for years, so it never opens all at once: the latest five, then five more at a time, each line landing on the rule."
use_for: "Billing: checking what came in and when."
never:
  - "Every line open at once on a long history"
  - "A list that outgrows its window: past six lines it scrolls inside it"
source: "conare-web app/components/console/billing/Grants.vue (take 1, show more), GrantLines.vue, app/composables/useGrow.ts, app/assets/css/console2.css (.v2-ledger, .v2-grantlist, .v2-grantbar, .v2-more)"
files:
  - components/product/CreditHistory.vue
examples:
  - "ShowMore | Show more"
---

Pass `grants` as `{ amount, reason, date }` (amount in the `currency`'s units, date as ISO); the order is by date,
newest first. `step` sets how many show at a time.
