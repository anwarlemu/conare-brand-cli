import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'
// The sheet behind How it works and the blog cards. The same seed draws the same burst; jumble and ledger change its
// pattern.
const bursts = [
  { label: 'How it works, seed 5', seed: 5, jumble: false, ledger: false },
  { label: 'Blog card, jumble', seed: 84, jumble: true, ledger: false },
  { label: 'Ledger', seed: 5, jumble: false, ledger: true },
]

export default function Site() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {bursts.map(b => (
        <figure key={b.label} className="flex flex-col gap-2">
          <span aria-hidden="true" className="relative grid aspect-[5/4] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden bg-ds-neutral-200 px-4 text-ds-neutral-300">
            <Grain />
            <span className="pointer-events-none absolute inset-0 opacity-70"><CellBurst seed={b.seed} jumble={b.jumble} ledger={b.ledger} /></span>
          </span>
          <figcaption className="type-meta text-fg-faint">{b.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}
