import { Carousel } from '@/react/components/ui/Carousel'
// Ways data comes in, three in view on a wide screen and one on a phone: swipe, scroll or use the arrows.
const ways = [
  { title: 'Connect an app', body: 'Slack, Notion, Gmail and 11 more, kept in sync.' },
  { title: 'Upload files', body: 'PDFs, documents and spreadsheets, read page by page.' },
  { title: 'Send by API', body: 'Write documents from your own code.' },
  { title: 'Paste text', body: 'A note or a policy, searchable at once.' },
  { title: 'Crawl a site', body: 'Your docs and help center, refreshed daily.' },
]

export default function Product() {
  return (
    <Carousel
      count={ways.length}
      label="ways to add data"
      perView={3}
      slide={({ index }) => (
        <div className="flex h-full flex-col gap-1 p-4">
          <span className="type-meta text-fg-muted tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <span className="type-ui-strong">{ways[index]!.title}</span>
          <span className="type-meta text-fg-muted">{ways[index]!.body}</span>
        </div>
      )}
    />
  )
}
