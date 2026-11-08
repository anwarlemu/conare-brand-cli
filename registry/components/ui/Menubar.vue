<script setup lang="ts">
import { provide, ref, type Ref } from 'vue'

// Menu triggers in a row on the paper (shadcn's menubar in Conare's grammar): a hairline strip, 28px triggers in 12px
// medium, each opening Menu's square panel of rows (MenubarMenu). One trigger is in the tab order; Left and Right move
// along the row, Down, Enter or Space open, and with a menu open Left and Right open the next one. While one is open,
// pointing at another trigger switches to it at once.
export interface MenubarEntry { key: string, el: () => HTMLElement | null, open: () => Promise<void> }
export interface MenubarContext { active: Ref<string | null>, focused: Ref<string | null>, entries: MenubarEntry[], move: (from: string, step: number, open: boolean) => void }
defineProps<{ label: string }>()
const active = ref<string | null>(null)
const focused = ref<string | null>(null)
const entries: MenubarEntry[] = []
function move(from: string, step: number, open: boolean) {
  const at = entries.findIndex(e => e.key === from)
  const next = entries[(at + step + entries.length) % entries.length]
  if (!next) return
  focused.value = next.key
  next.el()?.focus()
  if (open) void next.open()
}
provide<MenubarContext>('ds-menubar', { active, focused, entries, move })
</script>

<template>
  <div data-ds="menubar" role="menubar" :aria-label="label" class="inline-flex items-center gap-0.5 border border-edge bg-surface-subtle p-0.5">
    <slot />
  </div>
</template>
