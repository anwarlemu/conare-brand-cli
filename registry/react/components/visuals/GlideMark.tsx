// The gliding block itself (console2.css .v2-rowmark): the paper behind the row useGlideMark points at, moving on
// transform and height in 200ms on the strong ease-out, and placed without a glide the first time. Put it first inside
// the list (which is position: relative) and give the rows a z-index above it. Reduced motion places it at once.
export interface GlideMarkProps {
  mark: { y: number, h: number } | null
  instant?: boolean
}

export function GlideMark({ mark, instant }: GlideMarkProps) {
  if (!mark) return null
  return (
    <>
      <style href="ds-glide-mark" precedence="ds">{css}</style>
      <span data-ds="glide-mark" className="ds-rowmark" data-instant={instant || undefined} style={{ transform: `translateY(${mark.y}px)`, height: `${mark.h}px` }} aria-hidden="true" />
    </>
  )
}

export default GlideMark

const css = `
.ds-rowmark { position: absolute; top: 0; right: 0; left: 0; z-index: 0; background: var(--ds-color-surface-subtle); pointer-events: none; transition: transform var(--ds-duration-enter) var(--ds-easing-out), height var(--ds-duration-enter) var(--ds-easing-out); }
.ds-rowmark[data-instant] { transition: none; }
@media (prefers-reduced-motion: reduce) { .ds-rowmark { transition: none; } }
`
