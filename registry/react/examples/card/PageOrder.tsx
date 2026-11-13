import { Cable, Code } from 'lucide-react'
import { Card } from '@/react/components/ui/Card'
import { Door } from '@/react/components/ui/Door'
// The cards in the order a page uses them: the one block it leads with, the subjects under it, the ways in at the foot.

export default function PageOrder() {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">Leads the page</p>
      <Card framed><p className="type-ui">Conare reached the right page on 94 of 100 questions.</p></Card>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">One subject each</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Credits" actions={<a href="#" className="hover:text-fg">Billing</a>}>
          <div className="flex flex-col gap-2">
            <p><span className="type-heading-3">$268.73</span> <span className="type-meta text-fg-muted">left of $310.00</span></p>
            <div className="h-1 bg-edge" role="meter" aria-label="credits left" aria-valuemin={0} aria-valuemax={310} aria-valuenow={268.73}><span className="block h-full w-[87%] bg-surface-inverse" /></div>
          </div>
        </Card>
        <Card title="Queries" actions={<a href="#" className="hover:text-fg">Usage</a>}>
          <div className="flex flex-col gap-2">
            <p><span className="type-heading-3">186,402</span> <span className="type-meta text-fg-muted">this month</span></p>
            <div className="h-1 bg-edge" role="meter" aria-label="queries used" aria-valuemin={0} aria-valuemax={300000} aria-valuenow={186402}><span className="block h-full w-[62%] bg-surface-inverse" /></div>
          </div>
        </Card>
      </div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Ways in</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Door title="Connect an app" description="Slack, Notion, Gmail and 11 more." icon={Cable} />
        <Door title="Send by API" description="Write documents from your code." icon={Code} arrow />
      </div>
    </div>
  )
}
