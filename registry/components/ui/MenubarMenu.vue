<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, provide, useId, watch } from 'vue'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { onMenuRows, usePopover } from '@/composables/usePopover'
import type { MenubarContext } from '@/components/ui/Menubar.vue'

// One menu of a Menubar: its trigger and Menu's panel of rows (MenuItem, MenuLabel, MenuSeparator) under it.
const props = withDefaults(defineProps<{ label: string, width?: string }>(), { width: '224px' })
const bar = inject<MenubarContext>('ds-menubar')!
const key = useId()
const pop = usePopover({ side: 'bottom', align: 'start', gap: 4 })
provide('ds-menu-close', () => pop.hide(true))

async function open(focus: 'first' | 'last' | 'none' = 'first', keyboard = true) {
  await pop.show({ keyboard })
  await nextTick()
  if (focus === 'none') return pop.panel.value?.focus({ preventScroll: true })
  const rows = [...(pop.panel.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])]
  ;(focus === 'last' ? rows.at(-1) : rows[0])?.focus()
}
const entry = { key, el: () => pop.anchor.value, open: () => open('first') }
bar.entries.push(entry)
if (!bar.focused.value) bar.focused.value = key
onBeforeUnmount(() => bar.entries.splice(bar.entries.indexOf(entry), 1))

watch(pop.open, (now) => {
  if (now) bar.active.value = key
  else if (bar.active.value === key) bar.active.value = null
})
watch(bar.active, (a) => { if (a !== key && pop.open.value) pop.hide(false, true) })

function onClick(event: MouseEvent) {
  if (pop.open.value) return pop.hide(event.detail === 0, event.detail === 0)
  void open(event.detail === 0 ? 'first' : 'none', event.detail === 0)
}
function onEnter() {
  if (bar.active.value && bar.active.value !== key) void open('none', true)
}
function onTriggerKey(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    bar.move(key, event.key === 'ArrowRight' ? 1 : -1, false)
  }
  else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    void open(event.key === 'ArrowDown' ? 'first' : 'last')
  }
}
function onPanelKey(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    pop.hide(false, true)
    bar.move(key, event.key === 'ArrowRight' ? 1 : -1, true)
    return
  }
  onMenuRows(event, pop.panel.value, pop.hide)
}
</script>

<template>
  <button data-ds="menubar-menu"
    :ref="(el) => { pop.anchor.value = el as HTMLElement | null }"
    type="button"
    role="menuitem"
    aria-haspopup="menu"
    :aria-expanded="pop.open.value"
    :tabindex="bar.focused.value === key ? 0 : -1"
    class="inline-flex h-control-sm cursor-pointer items-center px-2.5 text-meta leading-5 font-medium text-fg transition-colors duration-120 ease-standard hover:bg-edge/45 aria-expanded:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus max-md:h-control-touch max-md:text-ui"
    @click="onClick"
    @pointerenter="onEnter"
    @focus="bar.focused.value = key"
    @keydown="onTriggerKey"
  >
    {{ label }}
  </button>
  <PopoverPanel data-ds="menubar-menu" :pop="pop" role="menu" :aria-label="label" tabindex="-1" class="flex flex-col p-1" :style="{ width: props.width }" @keydown="onPanelKey">
    <slot />
  </PopoverPanel>
</template>
