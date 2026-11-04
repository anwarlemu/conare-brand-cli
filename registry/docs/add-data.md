---
name: add-data
title: Add data
type: registry:product
group: product
description: "The ways data comes in, the fewest clicks first: a corpus sent by API with one prompt, an app connected with one click, or files that upload as they land. Nothing to name first."
use_for: "The namespaces page and Home."
never:
  - "Offering a way the account cannot use"
  - "Asking for a name before anything comes in"
source: "conare-web app/components/console/namespaces/AddData.vue, NewData.vue (take 1, API first), SendApi.vue (take 3), byapi/Prompt.vue, app/assets/css/console2.css (.v2-newdata, .v2-apptiles, .v2-apptile)"
files:
  - components/product/AddData.vue
examples:
  - "Product | As Home shows it"
---

It emits what was picked: `copied` (the prompt), `connect(app)`, `files(list)`, `open(namespace)`. Connect, upload and
watch for the first write in your app, and pass back `connecting` (an app's type), `uploading` (a count), `waiting`
and `landed`. Apps show their `logo` when given, otherwise a square tile with the initial.
