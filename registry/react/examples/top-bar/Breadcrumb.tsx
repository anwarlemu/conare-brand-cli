import { Breadcrumb as Trail } from '@/react/components/ui/Breadcrumb'
// The crumbs alone, as a breadcrumb anywhere: a long trail keeps every step back and truncates only the page.
const crumbs = [{ label: 'Overview', href: '#' }, { label: 'Sources', href: '#' }, { label: 'Acme drive', href: '#' }, { label: 'Quarterly planning notes for the platform team, final revision' }]

export default function Breadcrumb() {
  return (
    <div className="max-w-120">
      <Trail items={crumbs} onNavigate={(_, e) => e.preventDefault()} />
    </div>
  )
}
