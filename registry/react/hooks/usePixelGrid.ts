'use client'
import { useEffect, useState, type CSSProperties, type RefObject } from 'react'

// The website's dark button's red fill (PixelButton): 6px squares laid over an element, each with its own delay in
// and out, from the same seed as the website's, so the buttons feel like one product. It lays them again on resize.
const PX = 6

/** A seeded random source (mulberry32), the same as the website's, so every button scatters the same way. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface PixelGrid { cols: number, w: number, h: number, cells: Array<Record<string, number>> }

export function usePixelGrid(el: RefObject<HTMLElement | null>) {
  const [grid, setGrid] = useState<PixelGrid | null>(null)
  useEffect(() => {
    const box = el.current
    if (!box) return
    function lay() {
      if (!box) return
      const rect = box.getBoundingClientRect()
      const w = rect.width - (box.offsetWidth - box.clientWidth)
      const h = rect.height - (box.offsetHeight - box.clientHeight)
      setGrid((g) => {
        if (g?.w === w && g.h === h) return g
        const cols = Math.ceil(w / PX)
        const rows = Math.ceil(h / PX)
        const rand = rng(29)
        return {
          cols,
          w,
          h,
          cells: Array.from({ length: cols * rows }, (_, k) => {
            // Eased along the button, so the front starts quick and settles.
            const e = 1 - (1 - (k % cols) / cols) ** 1.6
            return { '--i': Math.round(e * 60 + rand() * 20), '--o': Math.round(e * 50 + rand() * 20) }
          }),
        }
      })
    }
    lay()
    const ro = new ResizeObserver(lay)
    ro.observe(box)
    return () => ro.disconnect()
  }, [el])
  const style: CSSProperties | undefined = grid ? { gridTemplateColumns: `repeat(${grid.cols}, ${PX}px)`, gridAutoRows: `${PX}px` } : undefined
  return { grid, style }
}
