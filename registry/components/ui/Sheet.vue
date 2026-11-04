<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useSheet } from '@/composables/useSheet'

// A panel at the right edge over the page (the docs panel, console2.css .v2-docs): 420px (the screen on a phone), a
// hairline at its edge, the 48px bar with the title and a close button, then the body (20px 26px 48px), scrolling on
// its own. It is modal: the page dims to 16% under it and stays inert. It comes in 16px from the right over 220ms on
// the strong ease-out and leaves in 160ms; Escape closes it at once; focus returns to what opened it.
defineProps<{ title: string, description?: string }>()
const open = defineModel<boolean>('open', { default: false })
const dialog = ref<HTMLDialogElement | null>(null)
const { shown, onCancel, onClick } = useSheet(dialog, open)
</script>

<template>
  <dialog ref="dialog" class="ds-sheet" :data-shown="shown || undefined" :aria-label="title" tabindex="-1" @cancel="onCancel" @click="onClick">
    <div class="flex h-bar shrink-0 items-center gap-1 border-b border-edge pr-2 pl-6.5">
      <h2 class="min-w-0 flex-1 truncate type-ui-strong">{{ title }}</h2>
      <slot name="bar" />
      <button type="button" class="inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-edge-focus max-md:size-control-touch" aria-label="close" @click="open = false"><X :size="14" :stroke-width="1.5" /></button>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6.5 pt-5 pb-12" data-sheet-body>
      <p v-if="description" class="mb-4 type-ui text-fg-soft">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.foot" class="flex shrink-0 justify-end gap-2 border-t border-edge px-6.5 py-3"><slot name="foot" /></div>
  </dialog>
</template>

<style>
.ds-sheet { position: fixed; inset: 0 0 0 auto; width: min(var(--ds-layout-sheet), 100vw); height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; border-left: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); opacity: 0; transform: translateX(16px); transition: opacity var(--ds-duration-glide) var(--ds-easing-out), transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-sheet[open] { display: flex; flex-direction: column; }
.ds-sheet:focus { outline: none; }
.ds-sheet[data-shown] { opacity: 1; transform: none; transition-duration: var(--ds-duration-settle); }
.ds-sheet::backdrop { background: var(--ds-color-scrim-light); opacity: 0; transition: opacity var(--ds-duration-glide) var(--ds-easing-out); }
.ds-sheet[data-shown]::backdrop { opacity: 1; transition-duration: var(--ds-duration-settle); }
@media (prefers-reduced-motion: reduce) { .ds-sheet { transform: none; } }
</style>
