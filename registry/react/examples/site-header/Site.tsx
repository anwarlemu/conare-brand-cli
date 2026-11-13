import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { SiteHeader } from '@/react/components/site/SiteHeader'
// The website header with the Product menu. Below 768px the links fold into the sheet behind the square button.
const items = [
  { label: 'Search', desc: 'Store documents and query them.', href: '#search' },
  { label: 'Sync', desc: 'Keep your apps in a namespace.', href: '#sync' },
  { label: 'Parse', desc: 'Read any file in full, every row and cell.', href: '#parse' },
  { label: 'Embed', desc: 'Embeddings for any vector database.', href: '#embed' },
  { label: 'Rerank', desc: 'Put the best passages first.', href: '#rerank' },
]
const more = [
  { label: 'Benchmarks', desc: 'Accuracy you can check, losses included.', href: '#benchmarks' },
  { label: 'Price vs accuracy', desc: 'Most accurate, and the cheapest.', href: '#price' },
]
const links = [{ label: 'FAQ', href: '#faq' }, { label: 'Pricing', href: '#pricing', current: true }, { label: 'Docs', href: '#docs' }]

export default function Site() {
  return (
    <div className="relative -m-8 min-h-150">
      <SiteHeader
        items={items}
        more={more}
        links={links}
        homeLabel="Acme home"
        logo={<img src="/conare-ds/logo/svg/primary-logo.svg" alt="" width="147" height="24" className="h-6 w-auto" />}
        actions={() => (
          <>
            <Button href="#contact">Contact us</Button>
            <PixelButton href="#dashboard">Dashboard</PixelButton>
          </>
        )}
      />
    </div>
  )
}
