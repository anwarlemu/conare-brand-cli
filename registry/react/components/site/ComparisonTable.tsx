import { SectionHead } from '@/react/components/site/SectionHead'

// What each plan includes, side by side: the band's head, then a table in the website's double rule. A row per thing;
// a column per plan, its name in Faculty Glyphic. A cell is the brand's red square (included), a short hairline (not
// included, said aloud for screen readers) or a few words. It scrolls sideways on phones and fades at its edges. The
// site has no comparison table: set from the pricing cards' rule, type and red square.
export type ComparisonRow = { feature: string, values: (boolean | string)[] }
export interface ComparisonTableProps { title: string, tag?: string, body?: string, plans: string[], rows: ComparisonRow[], titleId?: string, included?: string, excluded?: string }

export function ComparisonTable({ title, tag, body, plans, rows, titleId = 'comparison-title', included = 'Included', excluded = 'Not included' }: ComparisonTableProps) {
  return (
    <section data-ds="comparison-table" aria-labelledby={titleId} className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <SectionHead title={title} tag={tag} body={body} titleId={titleId} />
      <div className="mt-10 border border-edge outline outline-offset-4 outline-edge">
        <div className="fade-x overflow-x-auto" tabIndex={0} role="region" aria-labelledby={titleId}>
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-2/5 px-5 py-4 type-meta font-normal text-fg-muted"><span className="sr-only">Feature</span></th>
                {plans.map(p => <th key={p} scope="col" className="px-5 py-4 type-heading-3 font-normal text-fg">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.feature} className="border-t border-edge">
                  <th scope="row" className="px-5 py-4 text-body font-normal text-fg">{r.feature}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className="px-5 py-4 text-body text-fg">
                      {v === true ? <><span aria-hidden="true" className="inline-block size-2 bg-home-red" /><span className="sr-only">{included}</span></> : v === false ? <><span aria-hidden="true" className="inline-block h-px w-3 bg-edge-strong align-middle" /><span className="sr-only">{excluded}</span></> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ComparisonTable
