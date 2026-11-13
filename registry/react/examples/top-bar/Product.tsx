import { Breadcrumb } from '@/react/components/ui/Breadcrumb'
import { TopBar } from '@/react/components/ui/TopBar'
// The bar over every console page: where you are, each step back a link, the page in ink, a namespace in mono.
const crumbs = [{ label: 'Overview', href: '#' }, { label: 'Namespaces', href: '#' }, { label: 'contracts', mono: true }]

export default function Product() {
  return (
    <TopBar className="border border-edge">
      <Breadcrumb items={crumbs} onNavigate={(_, e) => e.preventDefault()} />
    </TopBar>
  )
}
