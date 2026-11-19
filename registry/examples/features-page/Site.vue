<script setup lang="ts">
import FeaturesPage from '@/components/site/FeaturesPage.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
// A product's page on sample data, in the site's frame.
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
  "tag": "Search",
  "title": "The right passage, from any file you bring.",
  "body": "Hybrid search, reranking and filters behind one key, with the sources of every answer.",
  "action": {
    "label": "Book a demo",
    "href": "#demo"
  }
}
const features = {
  "tag": "How it works",
  "title": "What search does for you.",
  "features": [
    {
      "title": "Search",
      "body": "Ask in plain words and get the passages that answer, ranked, with where each came from."
    },
    {
      "title": "Sync",
      "body": "Connect the apps your team uses. A changed record replaces the old one; a deleted one is deleted."
    },
    {
      "title": "Parse",
      "body": "Read any file in full: every page, table, row and cell, scanned or typed."
    },
    {
      "title": "Embed",
      "body": "Embeddings for any vector database, from the same models search runs on."
    },
    {
      "title": "Rerank",
      "body": "Put the best passages first, in one call after the search you already run."
    },
    {
      "title": "Audit",
      "body": "Every search, what it read and how long it took, kept for as long as you need."
    }
  ]
}
const logos = {
  "tag": "Integrations",
  "title": "Connect the apps your team already uses.",
  "logos": [
    {
      "name": "Acme",
      "mark": true
    },
    {
      "name": "Acme Labs",
      "mark": false
    },
    {
      "name": "Acme Cloud",
      "mark": false
    },
    {
      "name": "Acme Health",
      "mark": true
    },
    {
      "name": "Acme Freight",
      "mark": false
    },
    {
      "name": "Acme Bank",
      "mark": false
    },
    {
      "name": "Acme Retail",
      "mark": true
    },
    {
      "name": "Acme Energy",
      "mark": false
    },
    {
      "name": "Acme Legal",
      "mark": false
    },
    {
      "name": "Acme Studio",
      "mark": true
    },
    {
      "name": "Acme Robotics",
      "mark": false
    },
    {
      "name": "Acme Foods",
      "mark": false
    }
  ]
}
const testimonial = {
  "quote": "Our support agent answers from every ticket and policy we have, and when it is not sure, it says where it looked.",
  "role": "Head of support",
  "company": "Acme"
}
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
    <FeaturesPage
      :header="header"
      :footer="footer"
      :head="head"
      :features="features"
      :logos="logos"
      :testimonial="testimonial"
      :cta="cta"
    >
      <template #logo><span class="font-heading text-heading-3 text-fg">Acme</span></template>
      <template #actions><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></template>
    </FeaturesPage>
  </div>
</template>
