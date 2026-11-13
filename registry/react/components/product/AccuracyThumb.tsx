import { Fragment } from 'react'

// A document's page drawn small (the console's SearchPagePreview at thumb size): 28 by 36, a running head, eleven
// rules, and the passage where it sits as a band of darker rules on the red tint with a 2px red edge. A picture: the
// text beside it says the page number.
export interface AccuracyThumbProps { number: number, top: number }

const WIDTHS = [100, 97, 99, 94, 100, 62, 0, 98, 100, 95, 100, 71, 0]
const COUNT = 11

export function AccuracyThumb({ number, top }: AccuracyThumbProps) {
  const at = Math.min(COUNT - 3, Math.round(top * COUNT))
  const lines = Array.from({ length: COUNT }, (_, i) => ({ w: WIDTHS[(i + number * 3) % WIDTHS.length]!, hit: i >= at && i < at + 2, first: i === at }))
  return (
    <>
      <style href="ds-accuracy-thumb" precedence="ds">{css}</style>
      <span data-ds="accuracy-thumb" className="ds-thumb" aria-hidden="true">
        <span className="ds-thumb-head" />
        {lines.map((l, i) => (
          <Fragment key={i}>
            {l.first
              ? <span className="ds-thumb-hit"><span className="ds-thumb-line w-full" /><span className="ds-thumb-line w-[68%]" /></span>
              : !l.hit && <span className="ds-thumb-line" style={{ width: `${l.w}%` }} data-gap={l.w === 0 || undefined} />}
          </Fragment>
        ))}
      </span>
    </>
  )
}

export default AccuracyThumb

const css = `
.ds-thumb { position: relative; display: flex; width: 28px; height: 36px; flex-shrink: 0; flex-direction: column; gap: var(--ds-space-2xs); overflow: hidden; padding: 4px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); }
.ds-thumb-line { display: block; height: 1px; flex-shrink: 0; background: var(--ds-color-edge-strong); opacity: 0.55; }
.ds-thumb-line[data-gap] { opacity: 0; }
.ds-thumb-head { display: block; width: 34%; height: 1px; flex-shrink: 0; margin-bottom: 1px; background: var(--ds-color-edge-strong); }
.ds-thumb-hit { display: flex; flex-shrink: 0; flex-direction: column; gap: var(--ds-space-2xs); margin: 0 -2px; padding: 1px 2px; background: linear-gradient(var(--ds-color-edge-accent), var(--ds-color-edge-accent)) left / 2px 100% no-repeat, color-mix(in srgb, var(--ds-color-edge-accent) 14%, transparent); }
.ds-thumb-hit .ds-thumb-line { background: var(--ds-color-off-black); opacity: 0.8; }
`
