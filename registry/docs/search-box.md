---
name: search-box
title: Search box
type: registry:ui
group: product
description: "The search box and the library's input group: the question, attached files, the plus for more data, the scope, the Enter cue and the red arrow."
use_for: "Asking a question of the data; any field with controls before and after it (the input group)."
never:
  - "A single-line input for questions"
  - "A second submit button"
  - "Red on the box itself: the arrow is the only red"
source: "conare-web app/design-system/examples/field/Search.vue, app/assets/css/console2.css (.v2-searchbox, .v2-searchbox-bar, .v2-attach, .v2-addbtn)"
files:
  - components/product/SearchBox.vue
examples:
  - "Product | In the product"
---

`v-model` is the question; Enter searches and Shift+Enter breaks the line. `attached` lists files (`adding`, `added`, `failed`) that the app owns: the box emits `files` when they are picked or dropped, `paste` with pasted text, `remove` with a key, `connect` for Connect an app, and `submit` with the question. The add menu names `target`; turn it off with `:add-menu="false"`. The `scope` slot takes where it looks: the console's `scope-menu`. `busy` shows the dot matrix in the arrow while the search runs.
