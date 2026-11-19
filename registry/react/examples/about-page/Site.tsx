import { AboutPage } from '@/react/components/site/AboutPage'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
import type { DocsBlock } from '@/react/components/site/DocsBlocks'
// About the company on sample data, in the site's frame.
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
  "tag": "About",
  "title": "We make company data answer back.",
  "body": "Acme stores what a company knows, keeps it in step and hands the right part to its AI."
}
const story: DocsBlock[] = [
  {
    "kind": "p",
    "text": "Acme started with one question a support team kept asking: where did the agent get that? Every answer it gives now carries the passages it read."
  },
  {
    "kind": "p",
    "text": "We run the servers, the index and the sync jobs, so a team connects its apps and asks. Nothing to tune, nothing to host."
  },
  {
    "kind": "list",
    "items": [
      "Accuracy you can check, losses included.",
      "Your data serves your organization alone.",
      "Prices on the page, for every layer."
    ]
  }
]
const numbers = [
  {
    "value": "100M+",
    "label": "Documents searched"
  },
  {
    "value": "1.2B",
    "label": "Queries a month"
  },
  {
    "value": "180 ms",
    "label": "Typical search"
  },
  {
    "value": "14",
    "label": "Regions"
  }
]
const values = {
  "tag": "How we work",
  "title": "What we hold to.",
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
    }
  ]
}
const cta = {
  "title": "See it on your own data.",
  "action": {
    "label": "Book a demo",
    "href": "#demo"
  }
}
export default function Site() {
  return (
    <div className="-m-8">
      <AboutPage
        header={header}
        footer={footer}
        head={head}
        story={story}
        numbers={numbers}
        values={values}
        cta={cta}
        logo={<span className="font-heading text-heading-3 text-fg">Acme</span>}
        actions={() => (<><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></>)}
      />
    </div>
  )
}
