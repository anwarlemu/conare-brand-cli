'use client'
import { Fragment, useEffect, useId, useRef, useState, type FocusEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/react/lib/cn'
import { Grain } from '@/react/components/visuals/Grain'
import { useGlideMark } from '@/react/hooks/useGlideMark'

// The website header's Product dropdown (home/ProductMenu.vue): one column of the products with their one line, a
// rule, then the extra links (benchmarks, pricing), beside a portrait of the one under the pointer or focus on the dark
// grained panel, crossfading between items and playing again each time it shows (`window`, Vue's scoped slot). One highlight, the
// paper with a red square at its left, glides between items (glide-mark's useGlideMark, 160ms) while the item's title eases right to clear the
// square; it rests on the portrait's item when the pointer leaves the list. It opens on hover for a mouse and on
// press for touch and the keyboard; Escape (focus back on the button) or a press outside closes it. `current` gives the
// button the header's resting block and red square. Render it as an item of the header's link list.
export interface ProductMenuItem { label: string, desc: string, href: string }
export interface ProductMenuProps {
  items: ProductMenuItem[]
  more?: ProductMenuItem[]
  label?: string
  current?: boolean
  /** Draws an item's window in the portrait (Vue's `#window`): `active` while it shows, `plays` bumped each time. */
  window?: (slot: { item: ProductMenuItem, index: number, active: boolean, plays: number }) => ReactNode
}

export function ProductMenu({ items, more = [], label = 'Product', current, window: win }: ProductMenuProps) {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  openRef.current = open
  const root = useRef<HTMLLIElement | null>(null)
  const button = useRef<HTMLButtonElement | null>(null)
  const list = useRef<HTMLUListElement | null>(null)
  const id = `product-menu-${useId()}`

  // The portrait's item: the last one pointed at, back to the first on each opening. Each change bumps `plays`.
  const [pick, setPick] = useState(0)
  const [plays, setPlays] = useState(0)
  const pickRef = useRef(0)
  pickRef.current = pick
  // One highlight for the list, resting on the portrait's item when the pointer leaves.
  const { mark, shown, instant, hot, point, leave: rest, settle } = useGlideMark(list, () => pickRef.current)
  useEffect(() => {
    if (hot === null || hot === pickRef.current) return
    pickRef.current = hot
    setPick(hot)
    setPlays(p => p + 1)
  }, [hot])
  // The portraits are built the first time the menu opens, not with the page.
  const [opened, setOpened] = useState(false)
  const settleNext = useRef(false)
  useEffect(() => {
    if (!open) return
    setOpened(true)
    pickRef.current = 0
    setPick(0)
    setPlays(p => p + 1)
    settleNext.current = true
  }, [open])
  // After the render that shows the panel (Vue's nextTick).
  useEffect(() => {
    if (!settleNext.current) return
    settleNext.current = false
    settle()
  })

  function leave(event?: FocusEvent) {
    if (event && event.currentTarget.contains(event.relatedTarget as Node)) return
    rest()
  }
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (openRef.current && !root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !openRef.current) return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeydown)
    }
  }, [])
  const hover = (event: ReactPointerEvent, now: boolean) => { if (event.pointerType === 'mouse') setOpen(now) }
  const all = [...items, ...more]

  return (
    <>
      <style href="ds-product-menu" precedence="ds">{css}</style>
      <li data-ds="product-menu" ref={root} className="relative flex" onPointerEnter={e => hover(e, true)} onPointerLeave={e => hover(e, false)}>
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          data-nav-item
          aria-current={current ? 'location' : undefined}
          className={cn('ds-navlink-site relative flex cursor-pointer items-center gap-1 py-2 hover:text-fg', (open || current) && 'text-fg', current ? 'px-2.75' : 'px-4')}
          onPointerDown={() => setOpen(o => !o)}
          // Pointer activation toggles on pointerdown; detail 0 is the keyboard or assistive technology.
          onClick={e => { if (e.detail === 0) setOpen(o => !o) }}
        >
          {current && <span aria-hidden="true" className="size-1.5 shrink-0 bg-home-red" />}
          {label}
          <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className={cn('transition-[rotate] duration-200 ease-out motion-reduce:transition-none', open && 'rotate-180')} />
        </button>

        {/* pt-3 bridges the gap so the pointer can travel into the panel. */}
        <div id={id} hidden={!open} className="absolute top-full left-1/2 z-30 -translate-x-1/2 pt-3">
          <div className="grid w-160 max-w-[calc(100vw-32px)] grid-cols-2 gap-px border border-edge bg-edge">
            <div className="bg-surface p-2">
              <p className="ds-product-menu-label px-3 pt-2 pb-1 text-meta text-fg-muted">{label}</p>
              <ul ref={list} className="relative" onMouseLeave={() => leave()} onBlur={leave}>
                {mark && (
                  <li
                    aria-hidden="true"
                    className="ds-product-mark pointer-events-none absolute inset-x-0 top-0 bg-surface-subtle"
                    data-shown={shown || undefined}
                    data-instant={instant || undefined}
                    style={{ height: `${mark.h}px`, transform: `translateY(${mark.y}px)` }}
                  >
                    <span className="ds-product-dot absolute top-3.5 left-3 size-2 bg-home-red" />
                  </li>
                )}
                {all.map((item, i) => (
                  <Fragment key={item.label}>
                    {i === items.length && more.length > 0 && <li aria-hidden="true" className="mx-3 my-1 border-t border-edge" />}
                    <li className="relative" data-glide-row>
                      <a href={item.href} className="block px-3 py-2 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus" onMouseEnter={() => point(i)} onFocus={() => point(i)} onClick={() => setOpen(false)}>
                        <span className="ds-product-text block text-body leading-5 font-medium text-fg" data-hot={hot === i || undefined}>{item.label}</span>
                        <span className="block text-ui leading-5 text-fg-muted">{item.desc}</span>
                      </a>
                    </li>
                  </Fragment>
                ))}
              </ul>
            </div>
            {/* The portrait, as wide as the list: each item's window on the grained dark grey, crossfaded. */}
            <div className="bg-surface p-2">
              <div aria-hidden="true" className="relative grid h-full min-h-62.5 grid-cols-[minmax(0,1fr)] overflow-hidden bg-ds-neutral-200 text-ds-neutral-300">
                <Grain />
                {opened && all.map((item, i) => (
                  <div key={item.label} className="ds-product-art relative flex items-center justify-center px-3 py-4 [grid-area:1/1]" data-active={i === pick || undefined}>
                    {win
                      ? win({ item, index: i, active: open && i === pick, plays })
                      : (
                          <div className="relative w-full max-w-60 border border-ds-neutral-300 bg-ds-neutral-100 text-off-white">
                            <div className="flex h-6 items-center gap-1 border-b border-ds-neutral-300 px-2">{[1, 2, 3].map(k => <i key={k} className="size-1.5 bg-ds-neutral-300" />)}</div>
                            <div className="flex flex-col gap-1 p-3"><span className="type-code-sm">{item.label.toLowerCase()}</span><span className="type-meta text-ds-neutral-500">{item.desc}</span></div>
                          </div>
                        )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </li>
    </>
  )
}

export default ProductMenu

const css = `
/* The menu's small label: the website's capitals, 12px at 0.06em (home.css .label with uppercase). */
.ds-product-menu-label { letter-spacing: var(--ds-tracking-tag); text-transform: uppercase; }
.ds-navlink-site { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-navlink-site:active { background: var(--ds-color-surface-subtle); }
.ds-navlink-site:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
/* The highlight glides between items and fades when the pointer leaves the list; arriving from outside it fades in
   where it lands, without the slide. Its red square grows in, and the hovered title eases right of it. */
.ds-product-mark { opacity: 0; transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-product-mark[data-shown] { opacity: 1; }
.ds-product-mark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-product-dot { opacity: 0; transform: scale(0.5); transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-product-mark[data-shown] .ds-product-dot { opacity: 1; transform: none; }
.ds-product-text { transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-product-text[data-hot] { transform: translateX(16px); }
/* Windows crossfade, a little quicker out than in; the one being left freezes where it is. */
.ds-product-art { opacity: 0; transition: opacity var(--ds-duration-cell) ease; }
.ds-product-art[data-active] { opacity: 1; transition-duration: var(--ds-duration-micro); }
.ds-product-art:not([data-active]) * { animation-play-state: paused !important; }
@media (prefers-reduced-motion: reduce) {
  .ds-product-mark, .ds-product-dot { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
  .ds-product-text { transition: none; }
}
`
