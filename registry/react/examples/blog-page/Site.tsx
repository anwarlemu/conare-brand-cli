import { BlogPage } from '@/react/components/site/BlogPage'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
// The blog on sample data: pick a category or search the posts.
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
  "tag": "Blog",
  "title": "Get the latest updates."
}
const categories = [
  "Product",
  "Changelog",
  "Benchmarks"
]
const posts = [
  {
    "href": "#post-1",
    "title": "Search that says where it looked",
    "dek": "Every answer now carries the passages it read, with their scores.",
    "category": "Product",
    "author": "Acme team",
    "date": "Nov 12, 2026"
  },
  {
    "href": "#post-2",
    "title": "Sync for shared drives",
    "dek": "Connect a shared drive once and every folder in it stays in step.",
    "category": "Changelog",
    "author": "Acme team",
    "date": "Nov 4, 2026"
  },
  {
    "href": "#post-3",
    "title": "How we measure accuracy",
    "dek": "The benchmark we run every week, losses included.",
    "category": "Benchmarks",
    "author": "Acme research",
    "date": "Oct 28, 2026"
  },
  {
    "href": "#post-4",
    "title": "Reading tables cell by cell",
    "dek": "Why a parser that keeps rows together answers more questions.",
    "category": "Product",
    "author": "Acme team",
    "date": "Oct 20, 2026"
  },
  {
    "href": "#post-5",
    "title": "Deletes that stay deleted",
    "dek": "What happens to a record, and its index, when you remove it.",
    "category": "Changelog",
    "author": "Acme team",
    "date": "Oct 9, 2026"
  },
  {
    "href": "#post-6",
    "title": "Reranking on a budget",
    "dek": "One call after the search you already run, and where it helps most.",
    "category": "Benchmarks",
    "author": "Acme research",
    "date": "Sep 30, 2026"
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
      <BlogPage
        header={header}
        footer={footer}
        head={head}
        categories={categories}
        posts={posts}
        cta={cta}
        logo={<span className="font-heading text-heading-3 text-fg">Acme</span>}
        actions={() => (<><Button href="#contact">Contact us</Button><PixelButton href="#sign-in">Sign in</PixelButton></>)}
      />
    </div>
  )
}
