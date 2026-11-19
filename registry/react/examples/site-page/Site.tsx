import { SitePage } from '@/react/components/site/SitePage'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { SectionHead } from '@/react/components/site/SectionHead'
// A page in the site's frame: the announcement bar, the header, the page on its own ground and the footer pinned under it.
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
const announcement = {
  "tag": "New",
  "text": "Sync for shared drives is here.",
  "cta": "Read the post",
  "href": "#post"
}
export default function Site() {
  return (
    <div className="-m-8">
      <SitePage
        header={header}
        footer={footer}
        announcement={announcement}
        children={(
        <section className="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
          <SectionHead as="h1" tag="Docs" title="Everything in one place." body="Guides, the API and the SDK, for every part of Acme." />
        </section>
      )}
        logo={<span className="font-heading text-heading-3 text-fg">Acme</span>}
        actions={() => (<><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></>)}
      />
    </div>
  )
}
