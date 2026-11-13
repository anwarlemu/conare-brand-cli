'use client'
import { useEffect, useId, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode, type SyntheticEvent } from 'react'
import { cn } from '@/react/lib/cn'
import { ProductMenu, type ProductMenuItem } from '@/react/components/site/ProductMenu'

// The website header (home/Header.vue): solid off-white, 64px, a hairline under it, three columns so the links sit on
// the page's true center whatever the widths of the logo (`logo`) and the buttons (`actions`). The links are
// 14px soft, the Product menu first. Two paper blocks glide under them on transform: one rests on the current link
// (`current`, or `productCurrent`) with its red square, the other follows the pointer or focus, appearing in place on
// the first link and fading when it leaves the row. Below 768px the links fold into a sheet under the bar, opened by a
// square button whose 3 by 3 red squares turn into an X: the sheet unrolls on a clip and its rows rise in one after
// another; a link, Escape or a wider window closes it, quickly and all at once. `actions` renders twice, given
// `place` 'bar' or 'sheet'.
export interface SiteLink { label: string, href: string, current?: boolean }
export interface SiteHeaderProps {
  items: ProductMenuItem[]
  more?: ProductMenuItem[]
  links: SiteLink[]
  productCurrent?: boolean
  homeHref?: string
  homeLabel?: string
  /** The logo in the home link (Vue's `logo` slot). */
  logo?: ReactNode
  /** The buttons, drawn for the bar and again for the sheet (Vue's `#actions="{ place }"`). */
  actions?: (slot: { place: 'bar' | 'sheet' }) => ReactNode
}

// The two blocks: x and width of the item they sit under, drawn as a 1px block scaled to it so only transform moves.
interface Mark { x: number, w: number, shown: boolean, instant: boolean }
const markStyle = (m: Mark | null) => (m ? { transform: `translateX(${m.x}px) scaleX(${m.w})` } : undefined)

export function SiteHeader({ items, more = [], links, productCurrent, homeHref = '/', homeLabel = 'home', logo, actions }: SiteHeaderProps) {
  const [menu, setMenu] = useState(false)
  const sheetId = `site-menu-${useId()}`
  const row = useRef<HTMLUListElement | null>(null)
  const [restMark, setRestMark] = useState<Mark | null>(null)
  const [hoverMark, setHoverMark] = useState<Mark | null>(null)
  const restNow = useRef<Mark | null>(null)
  const hoverNow = useRef<Mark | null>(null)
  const setRest = (m: Mark | null) => { restNow.current = m; setRestMark(m) }
  const setHover = (m: Mark | null) => { hoverNow.current = m; setHoverMark(m) }

  function measure(item: HTMLElement, mark: Mark | null): Mark | null {
    if (!row.current) return mark
    return { x: item.getBoundingClientRect().left - row.current.getBoundingClientRect().left, w: item.offsetWidth, shown: true, instant: !mark?.shown }
  }
  function point(event: SyntheticEvent) {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-nav-item]')
    if (item) setHover(measure(item, hoverNow.current))
  }
  function rest(instant = false) {
    const here = row.current?.querySelector<HTMLElement>('[data-nav-item][aria-current]')
    if (here) setRest(measure(here, instant ? null : restNow.current))
    else if (restNow.current) setRest({ ...restNow.current, shown: false })
  }
  function leave(event?: FocusEvent) {
    if (event && row.current?.contains(event.relatedTarget as Node)) return
    if (hoverNow.current) setHover({ ...hoverNow.current, shown: false })
  }
  // A new current link: the resting block goes there (after the render, as Vue's nextTick).
  const currentKey = [productCurrent, ...links.map(l => l.current)].join()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    rest()
  }, [currentKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // The page's first frame places the blocks and colors without gliding into them.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false) }
    const mq = window.matchMedia('(min-width: 768px)')
    const onWide = (event: MediaQueryListEvent) => { if (event.matches) setMenu(false) }
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onWide)
    rest(true)
    void document.fonts?.ready.then(() => rest(true))
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onWide)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const rowsBefore = items.length + more.length

  return (
    <>
      <style href="ds-site-header" precedence="ds">{css}</style>
      <header data-ds="site-header" className="sticky top-0 z-20 border-b border-edge bg-surface" data-ready={ready || undefined}>
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
          <a href={homeHref} aria-label={homeLabel} className="flex shrink-0 justify-self-start outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-edge-focus">{logo}</a>

          {/* role="navigation" rather than <nav>, as the website's. */}
          <div role="navigation" aria-label="primary" className="hidden md:block">
            <ul ref={row} className="relative flex items-center gap-1 text-body leading-none text-fg-soft" onPointerOver={point} onFocus={point} onPointerLeave={() => leave()} onBlur={leave}>
              {[restMark, hoverMark].map((m, k) => (
                <li
                  key={k}
                  aria-hidden="true"
                  className="ds-site-mark pointer-events-none absolute inset-y-0 left-0 my-auto h-7.5 w-px origin-left bg-surface-subtle"
                  data-shown={m?.shown || undefined}
                  data-instant={m?.instant || undefined}
                  style={{ ...markStyle(m), ...(m ? {} : { display: 'none' }) }}
                />
              ))}
              <ProductMenu items={items} more={more} current={productCurrent} />
              {links.map(link => (
                <li key={link.label} className="relative flex">
                  <a
                    href={link.href}
                    data-nav-item
                    aria-current={link.current ? 'page' : undefined}
                    className={cn('ds-navlink-site relative flex items-center py-2 hover:text-fg', link.current ? 'gap-1.5 px-2.5 text-fg' : 'px-4')}
                  >
                    {link.current && <span aria-hidden="true" className="size-1.5 shrink-0 bg-home-red" />}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-start-3 flex gap-2 justify-self-end">
            <div className="flex gap-2 max-md:hidden">{actions?.({ place: 'bar' })}</div>
            <button
              type="button"
              className="ds-site-menu-btn flex size-6.5 cursor-pointer items-center justify-center border border-edge-strong text-fg transition-[border-color] duration-200 ease-standard hover:border-edge-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus md:hidden"
              data-open={menu || undefined}
              aria-expanded={menu}
              aria-controls={sheetId}
              aria-label={menu ? 'Close menu' : 'Open menu'}
              onPointerDown={() => setMenu(m => !m)}
              // Pointer activation toggles on pointerdown; detail 0 is the keyboard.
              onClick={(e) => { if (e.detail === 0) setMenu(m => !m) }}
            >
              <span aria-hidden="true" className="ds-site-grid">{Array.from({ length: 9 }, (_, i) => <i key={i + 1} data-edge={(i + 1) % 2 === 0 || undefined} />)}</span>
            </button>
          </div>
        </div>

        {/* The sheet unrolls from under the bar; closed, it is inert, so out of the tab order. */}
        <div id={sheetId} className="ds-site-sheet absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-edge bg-surface md:hidden" data-open={menu || undefined} inert={!menu}>
          <div className="mx-auto max-w-[1440px] px-4 pt-4 pb-5 sm:px-6">
            <p className="ds-site-row ds-site-caps px-1 pb-1 text-caption text-fg-muted" style={{ '--i': 0 } as CSSProperties}>Product</p>
            <ul className="border-b border-edge pb-3">
              {[...items, ...more].map((item, i) => (
                <li key={item.label} className="ds-site-row" style={{ '--i': i + 1 } as CSSProperties}>
                  <a href={item.href} className="block px-1 py-2" onClick={() => setMenu(false)}>
                    <span className="block text-body-lg leading-5 font-medium text-fg">{item.label}</span>
                    <span className="block text-ui leading-5 text-fg-muted">{item.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
            <ul className="pt-2">
              {links.map((link, j) => (
                <li key={link.label} className="ds-site-row" style={{ '--i': rowsBefore + 1 + j } as CSSProperties}>
                  <a href={link.href} className="block px-1 py-2.5 text-body-lg leading-5 text-fg" aria-current={link.current ? 'page' : undefined} onClick={() => setMenu(false)}>{link.label}</a>
                </li>
              ))}
            </ul>
            <div className="ds-site-row mt-4 grid grid-cols-2 gap-2" style={{ '--i': rowsBefore + links.length + 1 } as CSSProperties} onClick={() => setMenu(false)}>
              {actions?.({ place: 'sheet' })}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default SiteHeader

const css = `
.ds-site-caps { letter-spacing: var(--ds-tracking-tag); text-transform: uppercase; }
/* The blocks glide on transform (the Product menu's pace); arriving from outside they fade in where they land. */
.ds-site-mark { opacity: 0; transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-site-mark[data-shown] { opacity: 1; }
.ds-site-mark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
header:not([data-ready]) :is(.ds-site-mark, .ds-navlink-site) { transition: none; }
.ds-site-menu-btn:active { background: var(--ds-color-surface-subtle); }
/* The menu button's 3 by 3 in red: open, the four edge squares fade away while the corners and center grow from 3px
   to 5px, just enough to meet corner to corner, and the grid turns a quarter, so the five read as an X. */
.ds-site-grid { display: grid; grid-template-columns: repeat(3, 3px); gap: 2px; transition: transform var(--ds-duration-morph) var(--ds-easing-swap); }
.ds-site-grid i { width: 3px; height: 3px; background: var(--ds-color-home-red); transition: transform var(--ds-duration-morph) var(--ds-easing-swap) 80ms, opacity var(--ds-duration-morph) var(--ds-easing-swap) 80ms; }
.ds-site-menu-btn[data-open] .ds-site-grid { transform: rotate(90deg); }
.ds-site-menu-btn[data-open] .ds-site-grid i { transform: scale(1.667); }
.ds-site-menu-btn[data-open] .ds-site-grid i[data-edge] { opacity: 0; transform: scale(0.5); transition-delay: 0ms; }
/* The sheet unrolls downward on a clip (no layout moves) and its rows rise 6px and fade in 28ms apart; closing, it
   rolls back up quickly and all at once. */
.ds-site-sheet { visibility: hidden; clip-path: inset(0 0 100% 0); transition: clip-path var(--ds-duration-exit) var(--ds-easing-standard), visibility 0s linear var(--ds-duration-exit); }
.ds-site-sheet[data-open] { visibility: visible; clip-path: inset(0 0 -1px 0); transition: clip-path var(--ds-duration-entrance) var(--ds-easing-out), visibility 0s; }
.ds-site-row { opacity: 0; transform: translateY(6px); transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform 0s linear var(--ds-duration-exit); }
.ds-site-sheet[data-open] .ds-site-row { opacity: 1; transform: none; transition: opacity var(--ds-duration-entrance) var(--ds-easing-out), transform var(--ds-duration-entrance) var(--ds-easing-out); transition-delay: calc(80ms + var(--i) * 28ms); }
@media (prefers-reduced-motion: reduce) {
  .ds-site-mark, .ds-site-grid, .ds-site-grid i, .ds-site-sheet, .ds-site-sheet[data-open] { transition: none; }
  .ds-site-row, .ds-site-sheet[data-open] .ds-site-row { transform: none; transition: opacity var(--ds-duration-enter) var(--ds-easing-standard); transition-delay: 0ms; }
}
`
