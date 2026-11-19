---
name: settings-page
title: Settings page
type: registry:block
group: product
description: "Settings as the console draws it: one title and its parts as line tabs, switching in place, each part the settings table. General: the company's name to edit in place, its ID and when it joined, then Sign out. Members: who is in, with Invite members. Sign-in: each way in with its switch."
use_for: "A console's settings. Start a console page from ConsoleFrame and ConsolePage."
never:
  - "A form page per setting: edits open in their row"
  - "More than one dark button: Invite members on Members, Save while editing"
  - "Calling the API from the component: it emits rename, invite, remove, toggle and signOut"
source: "conare-web app/components/console/settings/SettingsFrame.vue (take 3: the parts as tabs), app/pages/dashboard/settings/index.vue, members.vue, sign-in.vue"
files:
  - components/product/SettingsPage.vue
examples:
  - "Product | Settings, in the console's frame"
---

`v-model:part` is the open tab (`general`, `members`, `sign-in`). The page draws on ConsolePage (from overview-page)
and Table's `settings` variant, whose last column of buttons is one width.
