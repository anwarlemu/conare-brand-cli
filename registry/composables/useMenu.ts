import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * A menu button's behavior: it opens on click, arrows move between items (opening the menu on their end of it from the
 * button), Home and End jump, Escape closes and returns focus to the button, Tab and a click outside close it.
 */
export function useMenu() {
  const open = ref(false)
  const root = ref<HTMLElement | null>(null)
  const trigger = ref<HTMLElement | null>(null)

  const items = () => [...(root.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])]

  async function show(focus: 'first' | 'last' | 'none' = 'first') {
    open.value = true
    await nextTick()
    // Opened at the fold it would land out of sight, and the button would seem to do nothing.
    items()[0]?.closest('[role="menu"]')?.scrollIntoView({ block: 'nearest' })
    if (focus === 'none') return
    const list = items()
    ;(focus === 'last' ? list.at(-1) : list[0])?.focus()
  }
  function close(refocus = false) {
    open.value = false
    if (refocus) trigger.value?.focus()
  }
  function toggle() {
    if (open.value) close()
    else void show('none')
  }
  function onTriggerKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      void show(event.key === 'ArrowDown' ? 'first' : 'last')
    }
    else if (event.key === 'Escape' && open.value) {
      event.preventDefault()
      close(true)
    }
  }
  function onMenuKey(event: KeyboardEvent) {
    const list = items()
    const at = list.indexOf(document.activeElement as HTMLElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    }
    else if (event.key === 'Tab') {
      close()
    }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      list[(at + step + list.length) % list.length]?.focus()
    }
    else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      ;(event.key === 'Home' ? list[0] : list.at(-1))?.focus()
    }
  }
  function outside(event: PointerEvent) {
    if (open.value && root.value && !root.value.contains(event.target as Node)) close()
  }
  onMounted(() => document.addEventListener('pointerdown', outside))
  onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))

  return { open, root, trigger, show, close, toggle, onTriggerKey, onMenuKey }
}
