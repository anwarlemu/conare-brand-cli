<script setup lang="ts">
import BlogPostPage from '@/components/site/BlogPostPage.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import type { DocsBlock } from '@/components/site/DocsBlocks.vue'
// A post on sample data, with more from its category under it.
const header = {
  "items": [
    {
      "label": "Search",
      "desc": "Find the answer in any file.",
      "href": "#search"
    },
    {
      "label": "Sync",
      "desc": "Keep your apps in step.",
      "href": "#sync"
    },
    {
      "label": "Parse",
      "desc": "Read every row and cell.",
      "href": "#parse"
    }
  ],
  "links": [
    {
      "label": "Pricing",
      "href": "#pricing"
    },
    {
      "label": "Blog",
      "href": "#blog"
    },
    {
      "label": "Docs",
      "href": "#docs"
    }
  ],
  "homeLabel": "Acme home"
}
const footer = {
  "columns": [
    {
      "title": "Product",
      "links": [
        {
          "label": "Search",
          "href": "#search"
        },
        {
          "label": "Sync",
          "href": "#sync"
        },
        {
          "label": "Parse",
          "href": "#parse"
        }
      ]
    },
    {
      "title": "Company",
      "links": [
        {
          "label": "About",
          "href": "#about"
        },
        {
          "label": "Blog",
          "href": "#blog"
        },
        {
          "label": "Changelog",
          "href": "#changelog"
        },
        {
          "label": "Contact",
          "href": "#contact"
        }
      ]
    },
    {
      "title": "Resources",
      "links": [
        {
          "label": "Docs",
          "href": "#docs"
        },
        {
          "label": "Pricing",
          "href": "#pricing"
        },
        {
          "label": "Status",
          "href": "#status"
        }
      ]
    }
  ],
  "tagline": "Search any data you bring. Get the right answer.",
  "legal": "© 2026 Acme, Inc.",
  "legalLinks": [
    {
      "label": "Privacy",
      "href": "#privacy"
    },
    {
      "label": "Terms",
      "href": "#terms"
    }
  ],
  "name": "Acme"
}
const post: { title: string, category: string, author: string, date: string, blocks: DocsBlock[] } = {
  "title": "Search that says where it looked",
  "category": "Product",
  "author": "Acme team",
  "date": "Nov 12, 2026",
  "blocks": [
    {
      "kind": "p",
      "text": "Search now returns the passages behind every answer, each with its document, its score and the namespace it came from."
    },
    {
      "kind": "h2",
      "id": "why",
      "text": "Why it matters"
    },
    {
      "kind": "p",
      "text": "An answer you can't check is an answer you can't ship. With the passages beside it, a reviewer sees what the agent read in one look."
    },
    {
      "kind": "list",
      "items": [
        "Every passage links to its document.",
        "Scores are on the same scale across namespaces.",
        "Nothing changes in the API: the passages come back in `sources`."
      ]
    },
    {
      "kind": "callout",
      "tone": "note",
      "text": "Older keys get the passages too. There is nothing to turn on."
    }
  ]
}
const link = {
  "label": "Read the docs",
  "href": "#docs"
}
const more = [
  {
    "href": "#post-4",
    "title": "Reading tables cell by cell",
    "dek": "Why a parser that keeps rows together answers more questions.",
    "category": "Product",
    "author": "Acme team",
    "date": "Oct 20, 2026"
  },
  {
    "href": "#post-1",
    "title": "Search that says where it looked",
    "dek": "Every answer now carries the passages it read, with their scores.",
    "category": "Product",
    "author": "Acme team",
    "date": "Nov 12, 2026"
  }
]
</script>

<template>
  <div class="-m-8">
    <BlogPostPage
      :header="header"
      :footer="footer"
      :post="post"
      blog-href="#blog"
      :link="link"
      :more="more"
    >
      <template #logo><span class="font-heading text-heading-3 text-fg">Acme</span></template>
      <template #actions><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></template>
    </BlogPostPage>
  </div>
</template>
