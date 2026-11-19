---
name: blog-page
title: Blog page
type: registry:block
group: site
description: "The blog: the head, the categories with a search beside them, the posts three across as blog cards, every card in a row one height, and the closing band. Nothing matching says so."
use_for: "A website's blog index."
never:
  - "Pagination: the posts load in one list"
  - "A featured post larger than the rest"
source: "conare-web app/pages/blog/index.vue, app/components/home/BlogCard.vue"
files:
  - components/site/BlogPage.vue
examples:
  - "Site | The blog, on sample data"
---

Built on `site-page`: `header`, `footer` and `announcement` are its props, and the `logo` and `actions` slots go to the header (`sheet-actions` too, in web components). The category and the search filter the `posts` in place; a post is blog-card's props.
