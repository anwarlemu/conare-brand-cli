import { Link } from '@/react/components/ui/Link'
// A link in a sentence, a row of them, and the quiet link that shows more of a list.

export default function Product() {
  return (
    <div className="grid items-start gap-2 type-ui md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">In a sentence</p>
      <p className="leading-7 text-fg-soft">No queries yet. <Link href="#search" className="text-fg">Try a search</Link></p>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a row</p>
      <p className="flex gap-4 leading-7"><Link href="#billing">Billing</Link><Link href="#docs">Docs</Link><Link href="#status">Status</Link></p>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Under a list</p>
      <p className="leading-7"><Link more>Show 5 more</Link></p>
    </div>
  )
}
