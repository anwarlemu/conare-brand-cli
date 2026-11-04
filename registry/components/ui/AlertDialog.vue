<script setup lang="ts">
import { nextTick, onMounted, ref, useId, watch } from 'vue'
import Button from '@/components/ui/Button.vue'

// A question that needs an answer before anything else (Dialog's window, Modal.vue): the title, one line saying what
// happens, then Cancel and the action, the danger button for what removes something. Focus starts on Cancel; the scrim
// does nothing, so only a choice closes it; Escape cancels and focus returns to what opened it. It rises 8px over
// 320ms, as Dialog. In a row, a held danger button (HoldButton) is better: it confirms without interrupting.
withDefaults(defineProps<{ title: string, description: string, action: string, cancel?: string, danger?: boolean }>(), { cancel: 'Cancel', danger: true })
const emit = defineEmits<{ confirm: [], cancel: [] }>()
const open = defineModel<boolean>('open', { default: false })
const dialog = ref<HTMLDialogElement | null>(null)
const id = useId()
let returnTo: HTMLElement | null = null

function show() {
  const d = dialog.value
  if (!d || d.open) return
  returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  d.showModal()
  d.querySelector<HTMLElement>('[data-cancel]')?.focus()
}
function close() {
  if (dialog.value?.open) dialog.value.close()
  returnTo?.focus({ preventScroll: true })
  returnTo = null
}
watch(open, async (now) => {
  await nextTick()
  if (now) show()
  else close()
})
onMounted(() => { if (open.value) show() })
function onCancel(event: Event) {
  event.preventDefault()
  emit('cancel')
  open.value = false
}
function choose(confirmed: boolean) {
  if (confirmed) emit('confirm')
  else emit('cancel')
  open.value = false
}
</script>

<template>
  <dialog ref="dialog" class="ds-alert" role="alertdialog" :aria-labelledby="`${id}-title`" :aria-describedby="`${id}-text`" @cancel="onCancel">
    <h2 :id="`${id}-title`" class="type-ui-strong">{{ title }}</h2>
    <p :id="`${id}-text`" class="mt-2 type-ui text-fg-soft">{{ description }}</p>
    <slot />
    <div class="mt-6 flex justify-end gap-2">
      <Button data-cancel @click="choose(false)">{{ cancel }}</Button>
      <Button :variant="danger ? 'danger' : 'dark'" @click="choose(true)">{{ action }}</Button>
    </div>
  </dialog>
</template>

<style>
.ds-alert { width: min(400px, calc(100vw - 32px)); margin: auto; padding: var(--ds-space-2xl); border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-alert::backdrop { background: var(--ds-color-scrim); }
.ds-alert[open] { animation: ds-alert-rise var(--ds-duration-entrance) var(--ds-easing-standard); }
@keyframes ds-alert-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .ds-alert[open] { animation: ds-alert-fade var(--ds-duration-enter) var(--ds-easing-standard); } }
@keyframes ds-alert-fade { from { opacity: 0; } }
</style>
