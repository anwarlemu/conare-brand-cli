<script setup lang="ts">
import ChangelogPage from '@/components/site/ChangelogPage.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import type { ChangelogEntry } from '@/components/site/ChangelogPage.vue'
// Three releases on sample data, newest first.
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
const head = {
  "tag": "Changelog",
  "title": "What changed.",
  "body": "Every release, newest first."
}
const entries: ChangelogEntry[] = [
  {
    "id": "v2-4",
    "date": "Nov 12, 2026",
    "version": "v2.4",
    "title": "Sources on every answer",
    "blocks": [
      {
        "kind": "p",
        "text": "Search returns the passages behind each answer, with their scores."
      },
      {
        "kind": "list",
        "items": [
          "Passages come back in `sources`.",
          "Scores share one scale across namespaces."
        ]
      }
    ]
  },
  {
    "id": "v2-3",
    "date": "Nov 4, 2026",
    "version": "v2.3",
    "title": "Shared drives",
    "blocks": [
      {
        "kind": "p",
        "text": "Connect a shared drive once; every folder in it stays in step."
      }
    ]
  },
  {
    "id": "v2-2",
    "date": "Oct 9, 2026",
    "version": "v2.2",
    "title": "Deletes that stay deleted",
    "blocks": [
      {
        "kind": "p",
        "text": "Removing a record removes it from the index in the same call."
      },
      {
        "kind": "callout",
        "tone": "note",
        "text": "Nothing to change on your side."
      }
    ]
  }
]
const cta = {
  "title": "See it on your own data.",
  "action": {
    "label": "Book a demo",
    "href": "#demo"
  }
}
</script>

<template>
  <div class="-m-8">
    <ChangelogPage
      :header="header"
      :footer="footer"
      :head="head"
      :entries="entries"
      :cta="cta"
    >
      <template #logo><span class="font-heading text-heading-3 text-fg">Acme</span></template>
      <template #actions><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></template>
    </ChangelogPage>
  </div>
</template>
