---
name: menubar
title: Menubar
type: registry:ui
group: ui
description: "Menu triggers in a row on the paper, each opening Menu's square panel of rows. Left and Right move along the row and carry an open menu with them; pointing at another trigger while one is open switches at once."
use_for: "A tool with several groups of commands on one surface, such as a document or a namespace editor."
never:
  - "Site or console navigation: use the Sidebar or the site header"
  - "One menu alone: use Menu"
source: "conare-web app/assets/css/console2.css (.v2-menu, .v2-menu-item, the sidebar head's trigger fill). New in Conare's style: shadcn's menubar."
files:
  - components/ui/Menubar.vue
  - components/ui/MenubarMenu.vue
examples:
  - "Product | A namespace's tools"
---
