import type { ReactNode } from 'react'
import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'

// The band before the website's footer (Cta.vue): the closing line and one action, centred on the red under the grain
// and a jumbled sheet of cells whose grid keeps redrawing itself (CellBurst jumble strong trace). A triple rule, the
// FAQ's width: the panel's border, an outline 4px out, and the frame's border 4px beyond that. Put the one action in
// children: a light button-link with fill="black", so its squares come in black on the red.
export interface CallToActionProps {
  title: string
  seed?: number
  titleId?: string
  children?: ReactNode
}

export function CallToAction({ title, seed = 53, titleId = 'cta-title', children }: CallToActionProps) {
  return (
    <>
      <style href="ds-call-to-action" precedence="ds">{css}</style>
      <section data-ds="call-to-action" aria-labelledby={titleId} className="mx-auto max-w-[1440px] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-40">
        <div className="mx-auto max-w-[1220px] border border-edge p-2.25">
          <div className="relative overflow-hidden border border-edge bg-home-red outline outline-offset-4 outline-edge">
            <Grain />
            <CellBurst seed={seed} jumble strong trace />
            <div className="relative flex flex-col items-center px-4 py-24 text-center sm:py-32">
              <h2 id={titleId} className="ds-cta-title font-heading text-heading-1 font-normal tracking-display text-off-white sm:text-display">{title}</h2>
              {children && <div className="mt-8">{children}</div>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default CallToAction

const css = `
.ds-cta-title { line-height: 1.1; text-wrap: balance; }
`
