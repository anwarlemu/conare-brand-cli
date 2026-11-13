'use client'
import { useEffect, useRef, useState, type Ref } from 'react'
import { cn } from '@/react/lib/cn'

// The headline reveal (HighlightText.vue, home.css .hl): each letter waits faint and red, fades up over 200ms, then
// settles to the heading's colour over 400ms. Lines go in order (100ms apart) and within a line the letters spread from
// the centre, or from the start on left-aligned text (40ms a letter). It plays once, when the heading comes on screen.
// `accent` is trailing characters that stay red, such as the hero's full stop. Without JavaScript, and with reduced
// motion, the text just shows. Use it once per view: a screen opened many times a day should not replay it.
export interface HighlightTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  text: string
  accent?: string
  className?: string
}

export function HighlightText({ as: Tag = 'h2', text, accent = '', className }: HighlightTextProps) {
  const el = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [on, setOn] = useState(false)
  const words = text.split(' ')

  useEffect(() => {
    const root = el.current
    if (!root) return
    let resize: ResizeObserver | undefined
    let io: IntersectionObserver | undefined
    let done = false
    let lit = false
    // Group the letters into rendered lines, then give each its delay.
    const stagger = () => {
      if (lit) return
      const chars = [...root.querySelectorAll<HTMLElement>('.ds-hl-char')]
      const align = getComputedStyle(root).textAlign
      const fromStart = align === 'left' || align === 'start'
      const lines: HTMLElement[][] = []
      let lastTop: number | null = null
      for (const c of chars) {
        const top = Math.round(c.getBoundingClientRect().top)
        if (lastTop === null || Math.abs(top - lastTop) > 4) lines.push([])
        lines[lines.length - 1]!.push(c)
        lastTop = top
      }
      lines.forEach((line, li) => {
        const mid = (line.length - 1) / 2
        line.forEach((c, ci) => {
          const step = fromStart ? ci : Math.abs(ci - mid)
          c.style.setProperty('--d', `${(0.1 * li + 0.04 * step).toFixed(3)}s`)
        })
      })
    }
    setReady(true)
    void (async () => {
      await document.fonts?.ready
      if (done) return
      stagger()
      resize = new ResizeObserver(stagger)
      resize.observe(root)
      io = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        io?.disconnect()
        resize?.disconnect()
        requestAnimationFrame(() => {
          lit = true
          setOn(true)
        })
      }, { threshold: 0, rootMargin: '0px 0px -15% 0px' })
      io.observe(root)
    })()
    return () => {
      done = true
      io?.disconnect()
      resize?.disconnect()
    }
  }, [])

  return (
    <>
      <style href="ds-highlight-text" precedence="ds">{css}</style>
      <Tag data-ds="highlight-text" ref={el as Ref<HTMLHeadingElement>} className={cn('ds-hl', ready && 'ds-hl-ready', on && 'ds-hl-on', className)}>
        <span className="sr-only">{text}{accent}</span>
        <span aria-hidden="true">
          {words.map((word, wi) => (
            <span key={wi}><span className="ds-hl-word">{word.split('').map((ch, ci) => <span key={ci} className="ds-hl-char">{ch}</span>)}{wi === words.length - 1 && accent && <span className="inline-block w-0 whitespace-nowrap">{accent.split('').map((ch, ci) => <span key={"a" + ci} className="ds-hl-char text-fg-accent-display">{ch}</span>)}</span>}</span>{wi === words.length - 1 ? '' : ' '}</span>
          ))}
        </span>
      </Tag>
    </>
  )
}

export default HighlightText

const css = `
.ds-hl-char { transition: opacity var(--ds-duration-enter) var(--ds-easing-reveal-fade) var(--d, 0s), color var(--ds-duration-reveal) var(--ds-easing-reveal-ink) calc(var(--d, 0s) + 0.2s); }
.ds-hl.ds-hl-ready:not(.ds-hl-on) .ds-hl-char { color: var(--ds-color-fg-accent-display); opacity: 0.2; transition: none; }
.ds-hl-word { display: inline-block; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .ds-hl.ds-hl-ready:not(.ds-hl-on) .ds-hl-char { color: inherit; opacity: 1; }
  .ds-hl.ds-hl-ready:not(.ds-hl-on) .ds-hl-char.text-fg-accent-display { color: var(--ds-color-fg-accent-display); }
  .ds-hl-char { transition: none; }
}
`
