'use client'
import { useEffect, useRef, useState } from 'react'

// The hero's frame drawn as a room in one-point perspective (RoomGrid.vue): the frame its picture plane, the vanishing
// point its centre, the same point Burst's slabs recede to. Orthogonals run from evenly spaced points on every edge to
// the back wall; transversals are the frame scaled about the centre, an equal step deeper each time, so the rings close
// up as floor tiles do. Each wall tile lights a shade above the red under the pointer, and a few light on their own,
// trading places every 600ms while the frame is on screen and the tab visible (never for reduced motion). Lay it in a
// `relative` red frame; the svg is click-through, only the tiles take the pointer.
const ACROSS = 12
const DOWN = 6
const DEPTH = 0.18
const INNER = 0.4

// Paths are joined with + rather than template strings: the registry's class check reads a path command followed by
// an interpolation as a class glued to one.
const orthogonals = (() => {
  let d = ''
  for (let i = 0; i <= ACROSS; i++) {
    const x = -1 + (2 * i) / ACROSS
    d += 'M' + x + ' -1L' + x * INNER + ' ' + -INNER + 'M' + x + ' 1L' + x * INNER + ' ' + INNER
  }
  for (let j = 1; j < DOWN; j++) {
    const y = -1 + (2 * j) / DOWN
    d += 'M-1 ' + y + 'L' + -INNER + ' ' + y * INNER + 'M1 ' + y + 'L' + INNER + ' ' + y * INNER
  }
  return d
})()

const rings = (() => {
  const out: number[] = []
  for (let k = 1; ; k++) {
    const s = 1 / (1 + k * DEPTH)
    if (s < INNER) break
    out.push(Math.round(s * 1e4) / 1e4)
  }
  out.push(INNER)
  return out
})()

// Each cell of the four walls, between two neighbouring orthogonals and two neighbouring rings, as its own quad.
const tiles = (() => {
  const depths = [1, ...rings]
  const xs = Array.from({ length: ACROSS + 1 }, (_, i) => -1 + (2 * i) / ACROSS)
  const ys = Array.from({ length: DOWN + 1 }, (_, j) => -1 + (2 * j) / DOWN)
  type P = [number, number]
  const out: { pts: string, k: number }[] = []
  const r = (n: number) => Math.round(n * 1e4) / 1e4
  const add = (q: P[], k: number) => out.push({ pts: q.map(p => r(p[0]) + ',' + r(p[1])).join(' '), k })
  for (let k = 0; k < depths.length - 1; k++) {
    const a = depths[k]!
    const b = depths[k + 1]!
    for (let i = 0; i < ACROSS; i++) {
      for (const y of [-1, 1]) add([[xs[i]! * a, y * a], [xs[i + 1]! * a, y * a], [xs[i + 1]! * b, y * b], [xs[i]! * b, y * b]], k)
    }
    for (let j = 0; j < DOWN; j++) {
      for (const x of [-1, 1]) add([[x * a, ys[j]! * a], [x * a, ys[j + 1]! * a], [x * b, ys[j + 1]! * b], [x * b, ys[j]! * b]], k)
    }
  }
  return out
})()

// Tile picks: a seeded source when check-parity defines __dsRandom for comparisons; real pages never do.
const random = () => ((globalThis as { __dsRandom?: () => number }).__dsRandom ?? Math.random)()
// A few tiles lit at random from the outer rings (the slabs cover the deeper ones), one swapped every SWAP_MS.
const LIT = 6
const SWAP_MS = 600
const OUTER = 4

export function RoomGrid() {
  const [lit, setLit] = useState<number[]>([])
  // What pickTile reads straight after a change, as Vue's ref gives it.
  const litNow = useRef<number[]>([])
  const root = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: number | undefined
    let visible = false
    const show = (next: number[]) => {
      litNow.current = next
      setLit(next)
    }
    const pickTile = () => {
      const pool = tiles.flatMap((t, i) => (t.k < OUTER && !litNow.current.includes(i) ? [i] : []))
      return pool[Math.floor(random() * pool.length)]!
    }
    const swap = () => {
      const next = [...litNow.current]
      next.splice(Math.floor(random() * next.length), 1, pickTile())
      show(next)
    }
    const play = (on: boolean) => {
      window.clearInterval(timer)
      if (on && !document.hidden) timer = window.setInterval(swap, SWAP_MS)
    }
    const onVisibility = () => play(visible)
    for (let n = 0; n < LIT; n++) show([...litNow.current, pickTile()])
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting
      play(visible)
    })
    if (root.current) io.observe(root.current)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const litSet = new Set(lit)
  return (
    <>
      <style href="ds-room-grid" precedence="ds">{css}</style>
      <svg data-ds="room-grid" ref={root} className="pointer-events-none absolute inset-0 h-full w-full" viewBox="-1 -1 2 2" preserveAspectRatio="none" aria-hidden="true">
        <g className="ds-room-tiles" pointerEvents="fill">
          {tiles.map((t, i) => <polygon key={t.pts} points={t.pts} data-lit={litSet.has(i) || undefined} />)}
        </g>
        <g fill="none" stroke="var(--ds-color-off-white)" strokeWidth="0.5" strokeOpacity="0.35" vectorEffect="non-scaling-stroke">
          <path d={orthogonals} vectorEffect="non-scaling-stroke" />
          {rings.map(s => <rect key={s} x={-s} y={-s} width={2 * s} height={2 * s} vectorEffect="non-scaling-stroke" />)}
        </g>
      </svg>
    </>
  )
}

export default RoomGrid

const css = `
/* A tile fades out slowly, lights a little quicker on its own, and at once under the pointer (home.css .room-tiles). */
.ds-room-tiles > polygon { fill: var(--ds-color-off-white); fill-opacity: 0; transition: fill-opacity var(--ds-duration-tile-fade) ease; }
.ds-room-tiles > polygon[data-lit="true"] { fill-opacity: 0.16; transition-duration: var(--ds-duration-tile-lit); }
@media (hover: hover) and (pointer: fine) {
  .ds-room-tiles > polygon:hover { fill-opacity: 0.22; transition-duration: var(--ds-duration-cell); }
}
@media (prefers-reduced-motion: reduce) { .ds-room-tiles > polygon { transition: none; } }
`
