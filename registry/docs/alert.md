---
name: alert
title: Alert
type: registry:ui
group: ui
description: "A red box for what broke: one box per problem, set apart, with the problem in words and the button that fixes it."
use_for: "Something the person must act on now, such as a source that stopped syncing."
never:
  - "Information that needs no action"
  - "Several problems in one box: one box each, however many there are"
source: "conare-web app/assets/css/console2.css (.v2-banner, .v2-banner-row, .v2-banner-mark)"
files:
  - components/ui/Alert.vue
examples:
  - "Product | Sources that failed"
---
