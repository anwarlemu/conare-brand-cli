import { Button } from '@/react/components/ui/Button'
import { Card } from '@/react/components/ui/Card'
import { Item } from '@/react/components/ui/Item'
import { ItemGroup } from '@/react/components/ui/ItemGroup'
// A card's rows: what a namespace is, a row with its tool, and rows that open something, filling to the card's edge
// under the pointer.

export default function Product() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="contracts">
        <ItemGroup className="-my-2">
          <li><Item title="Documents" meta={<span className="tabular-nums">412,830</span>} /></li>
          <li><Item title="Region" meta="United States" /></li>
          <li><Item title="Embedding model" description="Used for every document in it" meta={<span className="type-code-sm">acme-embed-1</span>} /></li>
          <li><Item title="API key" description="Last used 2 min ago" actions={<Button>Rotate</Button>} /></li>
        </ItemGroup>
      </Card>
      <Card title="Settings">
        <ItemGroup className="-my-2">
          <li><Item href="#members" title="Members" arrow meta="4 of 10 seats" /></li>
          <li><Item href="#billing" title="Billing" arrow meta="Pro" /></li>
          <li><Item href="#keys" title="API keys" description="Create and revoke keys" arrow /></li>
        </ItemGroup>
      </Card>
    </div>
  )
}
