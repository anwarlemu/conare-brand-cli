<script setup lang="ts">
import LegalPage from '@/components/site/LegalPage.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import type { DocsBlock } from '@/components/site/DocsBlocks.vue'
import type { LegalSection } from '@/components/site/LegalPage.vue'
// Terms on sample data: the side links lead to each section.
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
const intro: DocsBlock[] = [
  {
    "kind": "p",
    "text": "These terms are an agreement between you and Acme, Inc. and govern your use of the Acme website, console, API and SDK."
  }
]
const sections: LegalSection[] = [
  {
    "id": "accounts",
    "label": "Accounts",
    "blocks": [
      {
        "kind": "p",
        "text": "You give accurate information when you create an account, and you keep your sign-in details and API keys secure."
      }
    ]
  },
  {
    "id": "use",
    "label": "Use of the services",
    "blocks": [
      {
        "kind": "p",
        "text": "You may use the services for your internal business purposes. You agree not to:"
      },
      {
        "kind": "list",
        "items": [
          "use them against any law or anyone's rights;",
          "access other customers' data;",
          "get around rate limits or security measures."
        ]
      }
    ]
  },
  {
    "id": "content",
    "label": "Your content",
    "blocks": [
      {
        "kind": "p",
        "text": "You own everything you send to the services. We host and process it only to provide them to you."
      }
    ]
  },
  {
    "id": "fees",
    "label": "Fees",
    "blocks": [
      {
        "kind": "p",
        "text": "You pay for your use at the prices on the pricing page or in your order form, plus any taxes."
      }
    ]
  },
  {
    "id": "contact",
    "label": "Contact",
    "blocks": [
      {
        "kind": "p",
        "text": "Questions about these terms: [legal@acme.com](mailto:legal@acme.com)."
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
    <LegalPage
      :header="header"
      :footer="footer"
      tag="Legal"
      title="Terms of Service"
      updated="November 1, 2026"
      :intro="intro"
      :sections="sections"
      :cta="cta"
    >
      <template #logo><span class="font-heading text-heading-3 text-fg">Acme</span></template>
      <template #actions><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></template>
    </LegalPage>
  </div>
</template>
