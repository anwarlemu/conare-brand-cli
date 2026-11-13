import { Cable, Code } from 'lucide-react'
import { Card } from '@/react/components/ui/Card'
import { Door } from '@/react/components/ui/Door'
// A card with its head and body, the framed card a page leads with, and doors: whole cards that open something.

export default function Product() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Credits" actions={<a href="#" className="hover:text-fg">Billing</a>}>
        <div className="flex flex-col gap-2">
          <p><span className="type-heading-3">$268.73</span> <span className="type-meta text-fg-muted">left of $310.00</span></p>
          <div className="h-1 bg-edge" role="meter" aria-label="credits left" aria-valuemin={0} aria-valuemax={310} aria-valuenow={268.73}><span className="block h-full w-[87%] bg-surface-inverse" /></div>
        </div>
      </Card>
      <Card framed><p className="type-ui">The website's double rule, for the one block a page leads with.</p></Card>
      <Door title="Connect an app" description="Slack, Notion, Gmail and 11 more." icon={Cable} />
      <Door title="Send by API" description="Write documents from your code." icon={Code} arrow />
    </div>
  )
}
