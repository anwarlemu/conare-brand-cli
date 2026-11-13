'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { TransitionGroup } from '@/react/lib/transition'
import { toastStore, useToasts } from '@/react/hooks/useToast'

// The notes from useToast() at the bottom right, the newest lowest (console2.css .v2-toast): black, 12px, a check, the
// note and its detail in mono, for four seconds, three at most. One timer runs them all, only while there are any.
// Their time stops while one is pointed at and while the tab is hidden, so none leaves unread. The newest rises in on
// the strong ease-out, the others move up as it lands, and the oldest fades. Mount one per app.
const STEP = 100

// Two things the shared TransitionGroup does not do as Vue's does, handled here (see react/lib/transition.tsx):
// - A new note must start from its enter-from look in the first frame. The group measures the other notes for their
//   move before it adds the new one's enter classes, and that measure fixes the new note's style as it is, fully shown,
//   so its rise would start from the end. A note the toaster has not drawn yet carries data-fresh, which looks like
//   enter-from, until the group's classes are on it.
// - A note that has faded out must not come back for a frame before it goes: the group drops its leave classes when the
//   fade ends and removes it a render later. A note no longer in the list carries data-gone, hidden once its fade is over.
export function Toaster() {
  const toasts = useToasts()
  const held = useRef(false)
  const count = toasts.length
  const root = useRef<HTMLDivElement | null>(null)
  const drawn = useRef(new Set<number>())
  // After the group's own layout effect (a child's runs first): its enter and leave classes are on the notes by now.
  useLayoutEffect(() => {
    const ids = new Set(toasts.map(t => t.id))
    for (const node of root.current?.querySelectorAll<HTMLElement>('.ds-toast') ?? []) {
      const id = Number(node.dataset.id)
      node.removeAttribute('data-fresh')
      if (!ids.has(id)) node.setAttribute('data-gone', '')
    }
    for (const id of ids) drawn.current.add(id)
    for (const id of drawn.current) if (!ids.has(id)) drawn.current.delete(id)
  }, [toasts])
  useEffect(() => {
    if (!count) {
      held.current = false
      return
    }
    // ds-latency: the toasts' own clock, off the input path; nothing waits on it.
    const timer = setInterval(() => {
      if (held.current || document.hidden) return
      const next = toastStore.get().map(t => ({ ...t, left: t.left - STEP }))
      toastStore.set(next.filter(t => t.left > 0))
    }, STEP)
    return () => clearInterval(timer)
  }, [count > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <style href="ds-toaster" precedence="ds">{css}</style>
      <div ref={root} data-ds="toaster" className="ds-toasts" role="status" aria-live="polite" onPointerEnter={() => { held.current = true }} onPointerLeave={() => { held.current = false }}>
        <TransitionGroup name="ds-toast">
          {toasts.map(t => (
            <p key={t.id} className="ds-toast" data-id={t.id} data-fresh={drawn.current.has(t.id) ? undefined : ''}>
              <Check size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
              <span className="shrink-0">{t.text}</span>
              {t.detail && <span className="min-w-0 truncate type-code-sm">{t.detail}</span>}
            </p>
          ))}
        </TransitionGroup>
      </div>
    </>
  )
}

export default Toaster

const css = `
.ds-toasts { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 70; display: flex; width: min(320px, calc(100vw - 32px)); flex-direction: column; align-items: flex-end; gap: var(--ds-space-md); pointer-events: none; }
.ds-toast { display: flex; max-width: 100%; min-height: var(--ds-size-control-lg); align-items: center; gap: var(--ds-space-md); padding: 8px 12px; background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-size: var(--ds-text-meta); line-height: 20px; pointer-events: auto; }
.ds-toast-move { transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-toast-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-toast-leave-active { position: absolute; transition: opacity var(--ds-duration-fade) ease-out; }
.ds-toast-enter-from, .ds-toast-leave-to { opacity: 0; }
.ds-toast-enter-from { transform: translateY(8px); }
.ds-toast[data-fresh] { opacity: 0; transform: translateY(8px); }
.ds-toast[data-gone]:not(.ds-toast-leave-active) { position: absolute; opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .ds-toast-move { transition: none; }
  .ds-toast-enter-from, .ds-toast[data-fresh] { transform: none; }
}
`
