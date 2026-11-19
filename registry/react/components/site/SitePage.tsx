import type { ReactNode } from 'react'
import { AnnouncementBar } from '@/react/components/site/AnnouncementBar'
import { SiteFooter, type FooterLink } from '@/react/components/site/SiteFooter'
import { SiteHeader, type SiteLink } from '@/react/components/site/SiteHeader'
import type { ProductMenuItem } from '@/react/components/site/ProductMenu'

// Every website page's frame (pages/index.vue, pricing.vue, blog): the announcement bar if there is one, the header,
// then the page in <main> on its own off-white ground above the footer, which waits pinned under it from 768px and is
// uncovered as the page scrolls off it. `header` is SiteHeader's props, `footer` SiteFooter's and `announcement`
// AnnouncementBar's; `logo` and `actions` go to the header (`actions` renders for the bar and the sheet).
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/** A page's call to action: its words and where it goes. */
export type SiteAction = { label: string, href: string }
/** What every page built on this one takes for its frame. */
export interface SiteFrameProps {
  header: SiteHeaderData
  footer: SiteFooterData
  announcement?: SiteAnnouncement
  /** The logo in the header's home link (Vue's `logo` slot). */
  logo?: ReactNode
  /** The header's buttons, drawn for the bar and again for the sheet (Vue's `#actions="{ place }"`). */
  actions?: (slot: { place: 'bar' | 'sheet' }) => ReactNode
}
export interface SitePageProps extends SiteFrameProps {
  children?: ReactNode
  /** The root's data-ds (a page built on this one says its own, as Vue's fallthrough does). */
  'data-ds'?: string
}

export function SitePage({ header, footer, announcement, logo, actions, children, 'data-ds': ds = 'site-page' }: SitePageProps) {
  return (
    <div data-ds={ds} className="relative bg-surface text-fg">
      {announcement && <AnnouncementBar {...announcement} />}
      <SiteHeader {...header} logo={logo} actions={actions} />
      <main className="relative z-10 bg-surface">{children}</main>
      <SiteFooter {...footer} pinned />
    </div>
  )
}

export default SitePage
