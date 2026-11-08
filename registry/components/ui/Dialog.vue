<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

// A native dialog (the console's Modal.vue): the title, a close button, the form. Focus stays inside; Escape and the
// scrim close it. It starts in the first field; with none, focus rests on the window itself. `locked`: the scrim does
// nothing, while the window holds what can't be shown again. Square, a hairline, no shadow; it rises 8px over 320ms.
const props = defineProps<{ title: string, wide?: boolean, locked?: boolean }>()
const open = defineModel<boolean>('open', { default: false })
const dialog = ref<HTMLDialogElement | null>(null)

function show() {
  const d = dialog.value
  if (!d || d.open) return
  d.showModal()
  const field = d.querySelector<HTMLElement>('.ds-dialog-body :is(input:not([type="hidden"], [type="file"]), textarea, select):not(:disabled)')
  ;(field && field.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom ? field : d).focus()
}
watch(open, async (now) => {
  await nextTick()
  if (now) show()
  else if (dialog.value?.open) dialog.value.close()
})
onMounted(() => { if (open.value) show() })
// A click on the scrim lands on the dialog element itself.
function backdrop(event: MouseEvent) {
  if (event.target === dialog.value && !props.locked) open.value = false
}
</script>

<template>
  <dialog data-ds="dialog" ref="dialog" class="ds-dialog" :data-wide="wide || undefined" tabindex="-1" :aria-label="title" @close="open = false" @click="backdrop">
    <div class="flex items-center justify-between gap-4 pt-4 pr-4 pl-6">
      <h2 class="type-ui-strong">{{ title }}</h2>
      <button type="button" class="inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg max-md:size-control-touch" aria-label="close" @click="open = false"><X :size="14" :stroke-width="1.5" /></button>
    </div>
    <div class="ds-dialog-body px-6 pt-4 pb-6">
      <slot />
    </div>
    <div v-if="$slots.foot" class="flex justify-end gap-2 px-6 pb-6">
      <slot name="foot" />
    </div>
  </dialog>
</template>

<style>
.ds-dialog { width: min(480px, calc(100vw - 32px)); margin: auto; padding: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-dialog[data-wide] { width: min(720px, calc(100vw - 32px)); }
.ds-dialog:focus { outline: none; }
.ds-dialog::backdrop { background: var(--ds-color-scrim); }
.ds-dialog[open] { animation: ds-dialog-rise var(--ds-duration-entrance) var(--ds-easing-standard); }
@keyframes ds-dialog-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .ds-dialog[open] { animation: ds-dialog-fade var(--ds-duration-enter) var(--ds-easing-standard); } }
@keyframes ds-dialog-fade { from { opacity: 0; } }
</style>
