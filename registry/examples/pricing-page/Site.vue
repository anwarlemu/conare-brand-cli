<script setup lang="ts">
import PricingPage from '@/components/site/PricingPage.vue'
import Button from '@/components/ui/Button.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
// Pricing on sample data, in the site's frame.
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
  "tag": "Pricing",
  "title": "Pay for what you use.",
  "body": "Usage pricing for every layer, with no monthly minimum. Volume rates and enterprise terms are a conversation away.",
  "action": {
    "label": "Book a demo",
    "href": "#demo"
  }
}
const groups = [
  {
    "key": "search",
    "title": "Search",
    "body": "Store documents and query them. You pay for what you store and what you ask.",
    "cards": [
      {
        "name": "Queries",
        "amount": "$1",
        "unit": "per 1,000",
        "line": "Every search, ranked and with its sources.",
        "facts": [
          "Hybrid search",
          "Reranking included",
          "Filters on any field"
        ]
      },
      {
        "name": "Storage",
        "amount": "$0.10",
        "unit": "per GB a month",
        "line": "Documents and their index.",
        "facts": [
          "Encrypted at rest",
          "Kept in your region"
        ]
      }
    ]
  },
  {
    "key": "sync",
    "title": "Sync",
    "body": "Keep your apps in a namespace, in step as they change.",
    "cards": [
      {
        "name": "Connected apps",
        "amount": "$20",
        "unit": "per app a month",
        "line": "Each app you connect, synced as it changes.",
        "facts": [
          "Changes in minutes",
          "Deletes carried over"
        ]
      },
      {
        "name": "Parsing",
        "amount": "$3",
        "unit": "per 1,000 pages",
        "line": "Every page read in full, tables included.",
        "facts": [
          "Scanned and typed pages",
          "Tables kept as tables"
        ]
      },
      {
        "name": "Embeddings",
        "amount": "$0.02",
        "unit": "per 1M tokens",
        "line": "For any vector database you run.",
        "facts": []
      }
    ]
  }
]
const enterprise = {
  "title": "Enterprise",
  "body": "Built around your traffic, your cloud and your contracts. Scoped and priced with each customer.",
  "action": {
    "label": "Book a call",
    "href": "#demo"
  },
  "items": [
    {
      "name": "Your cloud",
      "line": "Run it in your own account, in the region you choose."
    },
    {
      "name": "Reserved capacity",
      "line": "Throughput held for you, at a rate set for the year."
    },
    {
      "name": "Single sign-on",
      "line": "Your identity provider, with roles mapped from it."
    },
    {
      "name": "Support",
      "line": "A named engineer and an answer within the hour."
    },
    {
      "name": "Terms",
      "line": "Your paper, your security review, your subprocessors list."
    },
    {
      "name": "Custom models",
      "line": "Models tuned on your data, serving your organization alone."
    }
  ]
}
const faq = [
  {
    "q": "How do I get started?",
    "a": "Book a demo. We set up your organization with you, and your team then creates API keys in the console."
  },
  {
    "q": "Is my data used to train models?",
    "a": "No. Your content serves your organization alone."
  },
  {
    "q": "What happens when a record changes?",
    "a": "A changed record replaces its old version. A deleted one is deleted."
  },
  {
    "q": "What do I have to run?",
    "a": "Nothing. The servers, the index and the sync jobs are ours to run."
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
    <PricingPage
      :header="header"
      :footer="footer"
      :head="head"
      :groups="groups"
      :enterprise="enterprise"
      :faq="faq"
      :cta="cta"
    >
      <template #logo><span class="font-heading text-heading-3 text-fg">Acme</span></template>
      <template #actions><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></template>
    </PricingPage>
  </div>
</template>
