'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'
import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'
import { useSeen } from '@/react/hooks/useCellBurst'

// A blog post as a card (BlogCard.vue): in its own ruled box, which takes the paper under the pointer, a picture (a
// grained dark panel and a jumbled sheet of cells) with the category in red at its top right, then the title, its
// line, and at the foot, each in a ruled tag, who it is from and the date. `window` (Vue's `#window` scoped slot) is
// what plays in the picture once the card is on screen (the website puts a benchmark's leaderboard there, an EvalViz,
// which is stretched to the box): it is laid out at one size on every card, 520 by 380, and scaled as a whole to fit,
// so every card's window matches and none reflows. It gets `active` once 40% of the picture is on screen and stays
// hidden, not blank, until then.
export interface BlogCardProps {
  href: string
  title: string
  dek?: string
  category: string
  author?: string
  date?: string
  seed?: number
  /** What plays in the picture, given `active` once the card is on screen. */
  window?: (slot: { active: boolean }) => ReactNode
}

const VIZ_W = 520
const VIZ_H = 380

export function BlogCard({ href, title, dek, category, author, date, seed, window: win }: BlogCardProps) {
  const art = useRef<HTMLSpanElement | null>(null)
  const seen = useSeen(art, 0.4)
  const burstSeed = seed ?? 71 + title.length * 13
  const [fit, setFit] = useState(0.7)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect
      setFit(Math.min((width * 0.88) / VIZ_W, (height * 0.88) / VIZ_H))
    })
    if (art.current) observer.observe(art.current)
    return () => observer.disconnect()
  }, [])
  return (
    <>
      <style href="ds-blog-card" precedence="ds">{css}</style>
      <a data-ds="blog-card" href={href} className="ds-blog-card flex w-full flex-col border border-edge p-2">
        <span ref={art} aria-hidden="true" className="relative grid aspect-[5/4] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden bg-ds-neutral-200 px-4 text-ds-neutral-300">
          <Grain />
          <span className="ds-blog-tag absolute top-2.5 right-2.5 z-1 bg-home-red py-0.5 pl-0.75 text-tag-sm font-medium tracking-tag text-off-white">{category}</span>
          <span className="pointer-events-none absolute inset-0 opacity-70"><CellBurst seed={burstSeed} jumble /></span>
          {win && (
            <span
              className={cn('absolute top-1/2 left-1/2 flex [&>.ds-viz]:h-full [&>.ds-viz]:max-w-none [&>.ds-viz>.ds-viz-card]:h-full', !seen && 'invisible')}
              style={{ width: `${VIZ_W}px`, height: `${VIZ_H}px`, transform: `translate(-50%, -50%) scale(${fit})` }}
            >
              {win({ active: seen })}
            </span>
          )}
        </span>
        <span className="mt-4 block px-2 text-card-title text-fg">{title}</span>
        {dek && <span className="mt-2 block px-2 text-body leading-5.5 text-fg-muted">{dek}</span>}
        {(author || date) && (
          <span className="mt-auto flex items-center justify-between gap-4 px-2 pt-6 pb-2 type-meta text-fg-faint">
            {author && <span className="border border-edge px-1.5 leading-5">{author}</span>}
            {date && <span className="ml-auto border border-edge px-1.5 leading-5 tabular-nums">{date}</span>}
          </span>
        )}
      </a>
    </>
  )
}

export default BlogCard

const css = `
.ds-blog-card { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-blog-card:hover { background-color: var(--ds-color-surface-subtle); } }
/* The category, in the section tag's red and capitals: 3px in, less the tracking on the right. */
.ds-blog-tag { padding-right: calc(var(--ds-space-xs) - 1px - var(--ds-tracking-tag)); line-height: var(--ds-text-tag-sm-leading); text-transform: uppercase; }
`
