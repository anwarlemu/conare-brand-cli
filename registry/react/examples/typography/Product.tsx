import { Text } from '@/react/components/ui/Text'
// The console's type: a page title in Faculty Glyphic, the 13px default, medium for emphasis, 12px meta, 11px
// captions, mono for keys and IDs, a link in a sentence and a query's words marked in a passage.

export default function Product() {
  return (
    <div className="grid items-baseline gap-x-6 gap-y-4 md:grid-cols-[112px_minmax(0,1fr)]">
      <Text variant="meta">title</Text>
      <Text variant="title">Namespaces</Text>
      <Text variant="meta">ui</Text>
      <Text>Connect a source and Conare keeps it in sync.</Text>
      <Text variant="meta">strong</Text>
      <Text variant="strong">412,830 documents</Text>
      <Text variant="meta">meta</Text>
      <Text variant="meta">Synced 2 min ago</Text>
      <Text variant="meta">caption</Text>
      <Text variant="caption">Shown to members of acme only.</Text>
      <Text variant="meta">code-sm</Text>
      <Text variant="code-sm">ns_contracts_2026</Text>
      <Text variant="meta">link</Text>
      <Text className="text-fg-soft">No queries yet. <Text variant="link" href="#">Try a search</Text></Text>
      <Text variant="meta">mark</Text>
      <Text className="text-fg-soft">Acme may <Text variant="mark">renew</Text> for twelve months with 60 days written notice.</Text>
    </div>
  )
}
