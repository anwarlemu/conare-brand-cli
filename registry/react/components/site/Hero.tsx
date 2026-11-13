'use client'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useControllable } from '@/react/hooks/useControllable'
import { SiteTag } from '@/react/components/ui/SiteTag'
import { HighlightText } from '@/react/components/visuals/HighlightText'
import { Burst } from '@/react/components/visuals/Burst'
import { Grain } from '@/react/components/visuals/Grain'
import { RoomGrid } from '@/react/components/visuals/RoomGrid'

// The home's first band (Hero.vue, UseCases.vue): the eyebrow tag, the headline in Faculty Glyphic with its red stop
// and its letter reveal (highlight-text: faint red letters settling to ink, once, as it comes on screen), one line, the
// one action (a button-link), then the red frame: a room in one-point perspective with the burst's slabs, under the
// grain, in a triple grey rule, with the window (`window`, given the picked tab) in front at up to 600px. The parts above settle up
// 12px in turn (320ms, 60ms apart). With `tabs`, the teams stand on the frame's top as stepped-corner tabs; the picked
// one is red, and a line along its foot fills over `turn` ms as the timer, handing over to the next team. The timer
// runs only while the frame is on screen, pauses while a pointer rests on it, and never runs for reduced motion.
// The picked tab is `value` with `onValueChange` (Vue's v-model), or `defaultValue` alone. Tab `mark` is an optional pixel pattern: a path on a 16px square.
export interface HeroProps {
  eyebrow?: string
  title: string
  accent?: string
  body?: string
  tabs?: { label: string, mark?: string }[]
  tabsLabel?: string
  turn?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** The headline drawn as you like, in place of the revealed `title` (Vue's `title` slot). */
  headline?: ReactNode
  /** The one action (Vue's `action` slot): a button-link. */
  action?: ReactNode
  /** The window in the frame, given the picked tab (Vue's `#window="{ active }"`). */
  window?: (slot: { active: number }) => ReactNode
}

export function Hero({ eyebrow, title, accent = '.', body, tabs = [], tabsLabel = 'Team', turn = 6000, value, defaultValue = 0, onValueChange, headline, action, window: win }: HeroProps) {
  const [active, setActive] = useControllable(value, defaultValue, onValueChange)
  const uid = useId()
  const stage = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  const [still, setStill] = useState(false)
  // Each pick restarts the timer.
  const [run, setRun] = useState(0)

  function pick(i: number) {
    if (i === active) return
    setActive(i)
    setRun(r => r + 1)
  }
  function next() {
    setActive((active + 1) % tabs.length)
    setRun(r => r + 1)
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const n = tabs.length
    const to = e.key === 'ArrowRight' ? (active + 1) % n : e.key === 'ArrowLeft' ? (active - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
    if (to === null) return
    e.preventDefault()
    pick(to)
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus()
  }

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (!stage.current || !('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting))
    io.observe(stage.current)
    return () => io.disconnect()
  }, [])

  const timed = tabs.length > 1 && turn > 0
  const titleClass = 'ds-hero-title font-heading text-hero font-normal tracking-display sm:text-display'
  return (
    <>
      <style href="ds-hero" precedence="ds">{css}</style>
      <section data-ds="hero" aria-labelledby={`${uid}-title`} className="ds-hero mx-auto max-w-[1440px] px-4 pt-24 pb-24 sm:px-6 lg:px-10 lg:pt-32">
        <div className="flex flex-col items-center text-center">
          {eyebrow && <p className="ds-settle mb-4 flex justify-center"><SiteTag>{eyebrow}</SiteTag></p>}
          {headline
            ? <h1 id={`${uid}-title`} className={titleClass}>{headline}</h1>
            : <HighlightText id={`${uid}-title`} as="h1" text={title} accent={accent} className={titleClass} />}
          {body && <p className="ds-settle mt-4 max-w-[600px] text-input text-balance text-fg-muted" style={{ '--i': 1 } as CSSProperties}>{body}</p>}
          {action && <div className="ds-settle mt-8" style={{ '--i': 2 } as CSSProperties}>{action}</div>}
        </div>

        <div ref={stage} className="ds-hero-stage mt-10 w-full lg:mt-14" data-running={inView && !still} style={{ '--turn': `${turn}ms` } as CSSProperties}>
          {tabs.length > 0 && (
            <div role="tablist" aria-label={tabsLabel} className="relative z-10 -mb-px flex items-end gap-px sm:justify-center sm:gap-1" onKeyDown={onKey}>
              {tabs.map((t, i) => (
                <button
                  id={`${uid}-tab-${i}`}
                  key={t.label}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  aria-controls={`${uid}-window`}
                  tabIndex={i === active ? 0 : -1}
                  className="ds-hero-tab relative flex h-8 min-w-0 flex-1 basis-0 items-center justify-center gap-2 overflow-hidden px-0.5 text-caption leading-4 whitespace-nowrap sm:h-9 sm:px-2 sm:text-ui md:w-36 md:flex-none md:px-4"
                  data-on={i === active}
                  onPointerDown={(e) => { if (e.button === 0) pick(i) }}
                  onClick={() => pick(i)}
                >
                  <span aria-hidden="true" className="ds-hero-tab-edge absolute inset-0" />
                  <span aria-hidden="true" className="ds-hero-tab-ground absolute inset-px" />
                  {t.mark && <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" className="ds-hero-tab-mark relative size-3.5 shrink-0 max-sm:hidden"><path d={t.mark} className="fill-current" /></svg>}
                  <span className="relative">{t.label}</span>
                  {i === active && timed && (
                    <span aria-hidden="true" className="absolute inset-x-px bottom-px h-0.5 overflow-hidden">
                      <span key={run} className="ds-hero-fill block h-full bg-off-white" onAnimationEnd={() => next()} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* The shell: the frame's outer rule, 9px out; the frame's second rule 5px out of its border. */}
          <div className="relative -mx-2.5 border border-edge-strong p-2.25">
            <div className="ds-hero-frame relative">
              <div className="relative flex w-full justify-center overflow-hidden border border-edge-strong bg-home-red px-4 py-10 text-ds-neutral-300 sm:px-8 sm:py-16 lg:py-20">
                <Grain />
                <RoomGrid />
                <Burst inner={0.01} corners />
                <div className="relative w-full max-w-[600px]">
                  <div id={`${uid}-window`} data-burst-clear className="relative z-10 w-full" role={tabs.length ? 'tabpanel' : undefined} aria-labelledby={tabs.length ? `${uid}-tab-${active}` : undefined}>
                    {win?.({ active })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero

const css = `
.ds-hero-title { line-height: 1.1; text-wrap: balance; }
/* Elements enter flat and settle upward (home.css .settle). */
.ds-settle { animation: ds-settle var(--ds-duration-entrance) var(--ds-easing-standard) both; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes ds-settle { from { opacity: 0; transform: translateY(12px); } }
.ds-hero-frame::before { position: absolute; inset: -5px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); content: ""; pointer-events: none; }
/* A short window (a small laptop, a phone on its side): less room above, a smaller heading, a closer frame. */
@media (max-height: 760px) and (min-width: 640px) {
  .ds-hero { padding-top: 40px; }
  .ds-hero-title { font-size: var(--ds-text-heading-1); }
  .ds-hero-stage { margin-top: var(--ds-space-2xl); }
}
@media (max-height: 480px) and (min-width: 640px) {
  .ds-hero { padding-top: var(--ds-space-2xl); }
  .ds-hero-title { font-size: var(--ds-text-heading-2); }
  .ds-hero-stage { margin-top: var(--ds-space-xl); }
}
/* The teams: both top corners stepped in three 3px pixels, the rule's grey under a ground 1px in, so a hairline runs
   up the sides and round the top and meets the frame's rule at the foot. Idle grey, darkening under the pointer as
   the pattern takes the red; the picked one red, its name and pattern off-white. */
.ds-hero-tab { color: var(--ds-color-neutral-400); cursor: pointer; transition: color var(--ds-duration-rise) var(--ds-easing-standard); }
.ds-hero-tab :is(.ds-hero-tab-edge, .ds-hero-tab-ground) { clip-path: polygon(0 9px, 3px 9px, 3px 6px, 6px 6px, 6px 3px, 9px 3px, 9px 0, calc(100% - 9px) 0, calc(100% - 9px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 6px, calc(100% - 3px) 6px, calc(100% - 3px) 9px, 100% 9px, 100% 100%, 0 100%); }
.ds-hero-tab-edge { background: var(--ds-color-neutral-600); }
.ds-hero-tab-ground { background: var(--ds-color-home-grey); transition: background-color var(--ds-duration-rise) var(--ds-easing-standard); }
.ds-hero-tab-mark { color: var(--ds-color-neutral-500); transition: color var(--ds-duration-rise) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-hero-tab:not([data-on="true"]):hover { color: var(--ds-color-off-black); }
  .ds-hero-tab:not([data-on="true"]):hover .ds-hero-tab-ground { background: color-mix(in srgb, var(--ds-color-neutral-700) 45%, var(--ds-color-home-grey)); }
  .ds-hero-tab:not([data-on="true"]):hover .ds-hero-tab-mark { color: var(--ds-color-home-red); }
}
.ds-hero-tab[data-on="true"] { color: var(--ds-color-off-white); }
.ds-hero-tab[data-on="true"] .ds-hero-tab-ground { background: var(--ds-color-home-red); }
.ds-hero-tab[data-on="true"] .ds-hero-tab-mark { color: var(--ds-color-off-white); }
.ds-hero-tab:focus-visible { outline-offset: -2px; }
/* The timer: a line filling along the picked tab's foot, linear over the turn, paused off screen and under a resting
   pointer. Reduced motion: no auto-advance, the line sits full. */
.ds-hero-fill { transform: scaleX(0); transform-origin: left; animation: ds-hero-fill var(--turn) linear forwards; animation-play-state: paused; }
.ds-hero-stage[data-running="true"] .ds-hero-fill { animation-play-state: running; }
@media (hover: hover) and (pointer: fine) { .ds-hero-stage[data-running="true"]:hover .ds-hero-fill { animation-play-state: paused; } }
@keyframes ds-hero-fill { to { transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .ds-settle { animation-name: ds-settle-fade; }
  .ds-hero-tab, .ds-hero-tab-ground, .ds-hero-tab-mark { transition: none; }
  .ds-hero-fill { animation: none; transform: none; }
}
@keyframes ds-settle-fade { from { opacity: 0; } }
`
