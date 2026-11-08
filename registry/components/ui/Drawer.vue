<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useSheet } from '@/composables/useSheet'

// A panel that slides in from an edge over a dimmed page (the console's phone sidebar, console2.css .v2-side on a
// phone): `left` (the default) and `right` are min(300px, 84vw) and full height, `bottom` is the screen's width and
// up to 85% of its height. It slides its own size in over 240ms on the strong ease-out and out in 180ms; the scrim is
// the page at 16%. A tap on the scrim or Escape (at once) closes it, and focus returns to what opened it. The title
// is for screen readers unless `bar` shows it in a 48px bar with a close button.
withDefaults(defineProps<{ title: string, side?: 'left' | 'right' | 'bottom', bar?: boolean }>(), { side: 'left' })
const open = defineModel<boolean>('open', { default: false })
const dialog = ref<HTMLDialogElement | null>(null)
const { shown, onCancel, onClick } = useSheet(dialog, open)
</script>

<template>
  <dialog data-ds="drawer" ref="dialog" class="ds-drawer" :data-side="side" :data-shown="shown || undefined" :aria-label="title" tabindex="-1" @cancel="onCancel" @click="onClick">
    <div v-if="bar" class="flex h-bar shrink-0 items-center gap-1 border-b border-edge pr-2 pl-4">
      <h2 class="min-w-0 flex-1 truncate type-ui-strong">{{ title }}</h2>
      <button type="button" class="inline-flex size-control-touch shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-edge-focus" aria-label="close" @click="open = false"><X :size="14" :stroke-width="1.5" /></button>
    </div>
    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain" data-sheet-body>
      <slot :close="() => (open = false)" />
    </div>
  </dialog>
</template>

<style>
.ds-drawer { position: fixed; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transition: transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-drawer[open] { display: flex; flex-direction: column; }
.ds-drawer:focus { outline: none; }
.ds-drawer[data-side="left"] { inset: 0 auto 0 0; width: min(300px, 84vw); height: 100dvh; border-right: var(--ds-border-hairline) solid var(--ds-color-edge); transform: translateX(-100%); }
.ds-drawer[data-side="right"] { inset: 0 0 0 auto; width: min(300px, 84vw); height: 100dvh; border-left: var(--ds-border-hairline) solid var(--ds-color-edge); transform: translateX(100%); }
.ds-drawer[data-side="bottom"] { inset: auto 0 0; width: 100vw; max-height: 85dvh; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); transform: translateY(100%); padding-bottom: env(safe-area-inset-bottom); }
.ds-drawer[data-shown] { transform: none; transition-duration: var(--ds-duration-drawer); }
.ds-drawer::backdrop { background: var(--ds-color-scrim-light); opacity: 0; transition: opacity var(--ds-duration-slide) var(--ds-easing-out); }
.ds-drawer[data-shown]::backdrop { opacity: 1; transition-duration: var(--ds-duration-drawer); }
@media (prefers-reduced-motion: reduce) {
  .ds-drawer, .ds-drawer[data-side] { transform: none; opacity: 0; transition: opacity var(--ds-duration-slide) var(--ds-easing-out); }
  .ds-drawer[data-shown] { opacity: 1; }
}
</style>
