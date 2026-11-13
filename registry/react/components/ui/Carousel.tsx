'use client'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'

// Slides in a row, one or more in view (new in Conare's style): square, a hairline round the track, the arrows as ghost
// icon buttons with the place in tabular figures between them. Native scroll snap, so a swipe or a trackpad moves it as
// the arrows do; arrow keys work on the focused track. Never plays on its own. Pass `count` and draw each slide with
// `slide({ index })` (Vue's `#slide` scoped slot). `perView` sets how many show at 768px and up (one on phones).
export interface CarouselProps {
  count: number
  label: string
  perView?: 1 | 2 | 3
  /** Draws slide `index` (Vue's `#slide="{ index }"`). */
  slide?: (slot: { index: number }) => ReactNode
}

export function Carousel({ count, label, perView = 1, slide }: CarouselProps) {
  const track = useRef<HTMLDivElement | null>(null)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(1)
  const last = Math.max(0, count - visible)
  // measure() reads the latest count through a ref, as Vue's computed does.
  const countRef = useRef(count)
  countRef.current = count

  function measure() {
    const el = track.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const v = Math.max(1, Math.round(el.clientWidth / first.offsetWidth))
    setVisible(v)
    setCurrent(Math.min(Math.max(0, countRef.current - v), Math.round(el.scrollLeft / first.offsetWidth)))
  }
  function go(i: number) {
    const el = track.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: Math.max(0, Math.min(last, i)) * first.offsetWidth, behavior: reduce ? 'auto' : 'smooth' })
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1) }
  }
  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    return () => ro.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style href="ds-carousel" precedence="ds">{css}</style>
      <section data-ds="carousel" className="flex flex-col gap-2" role="region" aria-roledescription="carousel" aria-label={label}>
        <div
          ref={track}
          className="ds-carousel flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain border border-edge"
          data-per-view={perView}
          tabIndex={0}
          aria-label={`${label}, use the arrow keys to move`}
          onScroll={measure}
          onKeyDown={onKey}
        >
          {Array.from({ length: count }, (_, k) => (
            <div
              key={k + 1}
              className="ds-carousel-slide shrink-0 snap-start border-e border-edge last:border-e-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${k + 1} of ${count}`}
            >
              {slide?.({ index: k })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" icon disabled={current <= 0} aria-label={`previous ${label}`} onClick={() => go(current - 1)}><ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" /></Button>
          <span className="min-w-12 text-center type-meta text-fg-muted tabular-nums" aria-live="polite">{`${current + 1} / ${last + 1}`}</span>
          <Button variant="ghost" icon disabled={current >= last} aria-label={`next ${label}`} onClick={() => go(current + 1)}><ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" /></Button>
        </div>
      </section>
    </>
  )
}

export default Carousel

const css = `
.ds-carousel { scrollbar-width: none; }
.ds-carousel::-webkit-scrollbar { display: none; }
.ds-carousel:focus-visible { outline-offset: var(--ds-border-focus); }
.ds-carousel-slide { width: 100%; }
@media (min-width: 768px) {
  .ds-carousel[data-per-view="2"] .ds-carousel-slide { width: 50%; }
  .ds-carousel[data-per-view="3"] .ds-carousel-slide { width: calc(100% / 3); }
}
`
