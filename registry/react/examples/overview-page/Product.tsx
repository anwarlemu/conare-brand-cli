import { Activity, Atom, CreditCard, Gauge, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-react'
import { ConsoleFrame } from '@/react/components/product/ConsoleFrame'
import { OverviewPage } from '@/react/components/product/OverviewPage'
// Overview as it ships, in the console's frame, on sample data: setup still open, Queries for the last 90 days,
// credits and the largest namespaces. Wire the events to your own routes.
const groups = [
  { label: 'Platform', links: [{ label: 'Overview', icon: House, active: true }, { label: 'Namespaces', icon: Layers, status: '6' }, { label: 'Sources', icon: Network, status: '1 failed', alert: true }, { label: 'Agents', icon: SquareTerminal }, { label: 'Custom models', icon: Atom }] },
  { label: 'Manage', links: [{ label: 'API keys', icon: KeyRound, status: '3' }, { label: 'Performance', icon: Gauge }, { label: 'Usage', icon: Activity }, { label: 'Billing', icon: CreditCard }, { label: 'Settings', icon: Settings }] },
]
// 90 days ending on Nov 4, a weekday rhythm with a slow climb.
const end = Date.UTC(2026, 10, 4)
const days = Array.from({ length: 90 }, (_, i) => {
  const at = new Date(end - (89 - i) * 86400000)
  const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6
  return { day: at.toISOString().slice(0, 10), value: Math.round((weekend ? 1800 : 5200) + i * 42 + ((i * 37) % 11) * 140) }
})
const thisMonth = days.filter(d => d.day.startsWith('2026-11')).reduce((a, d) => a + d.value, 0)
// The last 24 hours, every 30 minutes: p50 and p95.
const half = (i: number) => end - (47 - i) * 1800000
const latency = [
  { label: 'p50', points: Array.from({ length: 48 }, (_, i) => ({ t: half(i), v: 140 + ((i * 29) % 17) * 6 + (i % 12 === 5 ? 90 : 0) })) },
  { label: 'p95', points: Array.from({ length: 48 }, (_, i) => ({ t: half(i), v: 260 + ((i * 31) % 13) * 8 + (i % 12 === 5 ? 120 : 0) })) },
]
const namespaces = [
  { name: 'contracts', documents: 412830, health: 'ready' as const, synced: '2 min ago', lastUsed: '2 min ago' },
  { name: 'support', documents: 2184920, health: 'syncing' as const, lastUsed: '1 min ago' },
  { name: 'wiki', documents: 96410, health: 'ready' as const, synced: '12 min ago', lastUsed: '1 h ago' },
  { name: 'crm', documents: 52660, health: 'error' as const, lastUsed: 'yesterday' },
  { name: 'engineering', documents: 31902, health: 'api' as const, lastUsed: '3 days ago' },
  { name: 'research', documents: 7385, health: 'api' as const },
]

export default function Product() {
  return (
    <ConsoleFrame groups={groups} crumbs={[{ label: 'Overview' }]}>
      <OverviewPage
        greeting="Good afternoon"
        documents={2786122}
        setup={{ done: 3, total: 4 }}
        queries={{ thisMonth, p50: 182, p95: 296, days, latency }}
        credits={{ left: 412.6, total: 500, spenders: [{ name: 'support', cost: 54.2, share: 0.62 }, { name: 'contracts', cost: 21.85, share: 0.25 }, { name: 'wiki', cost: 0.4, share: 0.004 }] }}
        namespaces={namespaces}
      />
    </ConsoleFrame>
  )
}
