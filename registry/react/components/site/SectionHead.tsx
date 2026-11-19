import type { ReactNode } from 'react'
import { SiteTag } from '@/react/components/ui/SiteTag'

// How the website heads a page or a band (pricing.vue's head, Tag.vue, the blog and the bands of the home): the red tag
// in the site's capitals, then the line in Faculty Glyphic, 24px (32px from 640px) on 1.15 lines, balanced; under it
// one muted line and the one action (`action`), each 16px and 32px down. Centred by default; `align="start"` starts
// it at the left, for a head beside its content. `as="h1"` for the page's own head, h2 for a band.
export interface SectionHeadProps {
  title: string
  tag?: string
  body?: string
  as?: 'h1' | 'h2'
  align?: 'center' | 'start'
  titleId?: string
  /** The one action (Vue's `action` slot): a button-link. */
  action?: ReactNode
}

export function SectionHead({ title, tag, body, as: Heading = 'h2', align = 'center', titleId, action }: SectionHeadProps) {
  return (
    <>
      <style href="ds-section-head" precedence="ds">{css}</style>
      <div data-ds="section-head" className={align === 'center' ? 'flex flex-col items-center text-center' : 'flex flex-col items-start text-left'}>
        {tag && <p className="mb-4 flex"><SiteTag>{tag}</SiteTag></p>}
        <Heading id={titleId} className="ds-section-title max-w-[640px] font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">{title}</Heading>
        {body && <p className="mt-4 max-w-[560px] text-input text-fg-muted">{body}</p>}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </>
  )
}

export default SectionHead

const css = `
.ds-section-title { line-height: 1.15; text-wrap: balance; }
`
