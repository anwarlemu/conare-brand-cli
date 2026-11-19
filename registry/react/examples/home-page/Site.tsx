import type { CSSProperties } from 'react'
import { HomePage } from '@/react/components/site/HomePage'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { VizWindow } from '@/react/components/visuals/VizWindow'
// The home on sample data, in the site's frame; the hero's window is drawn on VizWindow.
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
const hero = {
  "eyebrow": "Search across 100M+ documents",
  "title": "Everything your agent needs to know",
  "body": "Acme finds the right answer in any data you bring, for your agents and the products you build on them.",
  "action": {
    "label": "Book a demo",
    "href": "#demo"
  }
}
const logos = {
  "tag": "Customers",
  "title": "Teams at Acme companies search with it.",
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
const features = {
  "tag": "Product",
  "title": "Everything retrieval needs, behind one key.",
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
const testimonial = {
  "quote": "Our support agent answers from every ticket and policy we have, and when it is not sure, it says where it looked.",
  "role": "Head of support",
  "company": "Acme"
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
export default function Site() {
  return (
    <div className="-m-8">
      <HomePage
        header={header}
        footer={footer}
        hero={hero}
        logos={logos}
        features={features}
        testimonial={testimonial}
        faq={faq}
        cta={cta}
        window={() => (
        <VizWindow
          active
          className="text-left"
          title={(
            <>
              <span className="text-ui">Acme</span>
              <span className="bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500">Support agent</span>
            </>
          )}
        >
          <div className="flex flex-col gap-4 px-4 pt-1 pb-5 sm:px-7 sm:pb-6">
            <p className="ds-viz-in self-end bg-ds-neutral-200 px-3 py-2 text-body" style={{ '--d': 200 } as CSSProperties}>How does a customer reset their key?</p>
            <p className="ds-viz-in text-body text-ds-neutral-600" style={{ '--d': 700 } as CSSProperties}>Settings, then API keys: revoke the old one and create a new one in its place.</p>
            <p className="ds-viz-in flex items-center gap-2 text-meta text-ds-neutral-500" style={{ '--d': 900 } as CSSProperties}>Source <span className="ds-viz-chip text-off-white"><span className="ds-viz-dot bg-home-red" />help-center.md</span></p>
          </div>
        </VizWindow>
      )}
        logo={<span className="font-heading text-heading-3 text-fg">Acme</span>}
        actions={() => (<><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></>)}
      />
    </div>
  )
}
