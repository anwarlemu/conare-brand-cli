import { Meter } from '@/react/components/ui/Meter'
import { Table } from '@/react/components/ui/Table'
import { formatNumber } from '@/react/hooks/useChart'
// What drives a total: each row's share as a bar, the largest red. Point at a row, or focus it, and its percent rolls
// up to what it cost.
const lines = [
  { name: 'sec-filings', queries: 50908, share: 21, cost: '$26.59' },
  { name: 'contracts', queries: 33658, share: 14, cost: '$17.58' },
  { name: 'slack', queries: 18317, share: 7, cost: '$9.57' },
  { name: 'crm', queries: 14127, share: 6, cost: '$7.38' },
]

export default function Share() {
  return (
    <>
      <style href="ds-example-share" precedence="ds">{css}</style>
      <Table framed label="share of credits used">
        <thead><tr><th className="sm:w-40">Namespace</th><th><span className="sr-only">Share bar</span></th><th className="w-24 text-right">Queries</th><th className="w-32 text-right">% of credits used</th></tr></thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={l.name} className="share-row" tabIndex={0}>
              <td className="type-code-sm">{l.name}</td>
              <td><Meter value={l.share * 3} tone={i ? 'default' : 'top'} decorative /></td>
              <td className="text-right tabular-nums">{formatNumber(l.queries)}</td>
              <td className="text-right font-medium tabular-nums">
                <span className="share-roll"><span className="share-a">{`${l.share}%`}</span><span className="share-b">{l.cost}</span></span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

const css = `
/* The percent rolls up to the cost under the pointer or focus, both in one cell, so nothing moves. */
.share-roll { position: relative; display: block; overflow: hidden; line-height: 1.4; }
.share-a, .share-b { display: block; transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.share-b { position: absolute; inset-inline: 0; top: 0; transform: translateY(110%); }
.share-row:focus-visible .share-a { transform: translateY(-110%); }
.share-row:focus-visible .share-b { transform: none; }
@media (hover: hover) and (pointer: fine) {
  .share-row:hover .share-a { transform: translateY(-110%); }
  .share-row:hover .share-b { transform: none; }
}
@media (prefers-reduced-motion: reduce) { .share-a, .share-b { transition: none; } }
`
