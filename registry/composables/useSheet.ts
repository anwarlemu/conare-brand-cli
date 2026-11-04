import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { firstFocusable } from '@/composables/usePopover'

/**
 * A native modal dialog that slides (Sheet, Drawer): showModal keeps focus inside and the page inert; the panel and its
 * scrim come in on `data-shown` and leave on its removal, closing once the exit transition has run (read from CSS, so
 * reduced motion and the tokens decide). Escape closes at once (keyboard actions don't animate); the scrim closes it;
 * focus returns to what opened it. Focus starts on the first control in `[data-autofocus]` or the body, else the panel.
 */
export function useSheet(dialog: Ref<HTMLDialogElement | null>, open: Ref<boolean>, options: { dismissable?: () => boolean } = {}) {
  const shown = ref(false)
  let returnTo: HTMLElement | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  function exitMs(el: HTMLElement) {
    const parts = getComputedStyle(el).transitionDuration.split(',').map(s => Number.parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))
    return Math.max(0, ...parts.filter(n => !Number.isNaN(n)))
  }
  async function show() {
    const d = dialog.value
    if (!d || d.open) return
    clearTimeout(timer)
    returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    d.showModal()
    const start = d.querySelector<HTMLElement>('[data-autofocus]') ?? firstFocusable(d.querySelector<HTMLElement>('[data-sheet-body]'))
    ;(start ?? d).focus({ preventScroll: true })
    // One frame at the closed state, so the transition has somewhere to start.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    shown.value = true
  }
  function finish() {
    dialog.value?.close()
    returnTo?.focus({ preventScroll: true })
    returnTo = null
  }
  async function hide(instant = false) {
    const d = dialog.value
    if (!d?.open) return
    shown.value = false
    if (instant) return finish()
    await nextTick()
    // ds-latency: the dialog stays in the top layer until its exit has played.
    timer = setTimeout(finish, exitMs(d))
  }
  watch(open, (now) => { void (now ? show() : hide()) })
  onMounted(() => { if (open.value) void show() })
  onBeforeUnmount(() => clearTimeout(timer))

  /** Escape: at once, no exit motion. */
  function onCancel(event: Event) {
    event.preventDefault()
    if (options.dismissable && !options.dismissable()) return
    open.value = false
    void hide(true)
  }
  /** A press on the scrim lands on the dialog element itself. */
  function onClick(event: MouseEvent) {
    if (event.target === dialog.value && (!options.dismissable || options.dismissable())) open.value = false
  }
  return { shown, onCancel, onClick, hide }
}
