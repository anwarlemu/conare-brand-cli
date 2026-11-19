---
name: blog-post-page
title: Blog post page
type: registry:block
group: site
description: "A blog post: the trail and the title centred, a wide dark panel as the picture, who it is from and when, the text in one narrow column, a link on, then more posts from the category."
use_for: "A blog post."
never:
  - "A sidebar beside the text: the column is the page"
  - "Comments"
source: "conare-web app/pages/blog/[slug].vue"
files:
  - components/site/BlogPostPage.vue
examples:
  - "Site | A post, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). `post.blocks` takes docs-blocks' blocks; `more` takes blog-card props.
