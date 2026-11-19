'use client'
import { useState } from 'react'
import { ContactPage } from '@/react/components/site/ContactPage'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
// Contact on sample data: send the form to see what happens next.
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
  "tag": "Contact",
  "title": "Talk to the team.",
  "body": "Tell us what you want to build. We reply by email."
}
const channels = [
  {
    "label": "Sales",
    "value": "sales@acme.com",
    "href": "mailto:sales@acme.com"
  },
  {
    "label": "Support",
    "value": "support@acme.com",
    "href": "mailto:support@acme.com"
  },
  {
    "label": "Security",
    "value": "security@acme.com",
    "href": "mailto:security@acme.com"
  }
]
export default function Site() {
  const [sent, setSent] = useState(false)
  return (
    <div className="-m-8">
      <ContactPage
        header={header}
        footer={footer}
        head={head}
        channels={channels}
        sent={sent}
        onSubmit={() => setSent(true)}
        onEdit={() => setSent(false)}
        logo={<span className="font-heading text-heading-3 text-fg">Acme</span>}
        actions={() => (<><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></>)}
      />
    </div>
  )
}
