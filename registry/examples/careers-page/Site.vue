<script setup lang="ts">
import CareersPage from '@/components/site/CareersPage.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
// The careers page on sample data: four open roles.
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
const roles = [
  {
    "title": "Product engineer",
    "team": "Engineering",
    "place": "Remote",
    "href": "#product-engineer"
  },
  {
    "title": "Search engineer",
    "team": "Engineering",
    "place": "San Francisco",
    "href": "#search-engineer"
  },
  {
    "title": "Designer",
    "team": "Design",
    "place": "Remote",
    "href": "#designer"
  },
  {
    "title": "Support engineer",
    "team": "Customers",
    "place": "London",
    "href": "#support-engineer"
  }
]
</script>

<template>
  <div class="-m-8">
    <CareersPage :header="header" :footer="footer" tag="Careers" title="Build search people trust." body="A small team that ships every week. These are the roles open now." :roles="roles" empty="No roles are open right now. Write to us anyway.">
      <template #logo><span class="font-heading text-heading-3 text-fg">Acme</span></template>
      <template #actions><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></template>
    </CareersPage>
  </div>
</template>
