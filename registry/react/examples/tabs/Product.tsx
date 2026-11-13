import { Tabs } from '@/react/components/ui/Tabs'
// The segmented control, for a chart's view and its range: the white block glides to the pick.

export default function Product() {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">Views of one thing</p>
      <div><Tabs defaultValue="volume" options={[{ value: 'volume', label: 'Volume' }, { value: 'latency', label: 'Latency' }]} label="chart view" /></div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">A range</p>
      <div><Tabs defaultValue="24h" options={['1h', '24h', '7d']} label="range" /></div>
    </div>
  )
}
