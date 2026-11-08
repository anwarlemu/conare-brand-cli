<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'
import { useToasts } from '@/composables/useToast'

// The notes from useToast() at the bottom right, the newest lowest (console2.css .v2-toast): black, 12px, a check, the
// note and its detail in mono, for four seconds, three at most. One timer runs them all, only while there are any.
// Their time stops while one is pointed at and while the tab is hidden, so none leaves unread. The newest rises in on
// the strong ease-out, the others move up as it lands, and the oldest fades. Mount one per app.
const toasts = useToasts()
const held = ref(false)
const STEP = 100
let timer: ReturnType<typeof setInterval> | undefined
function tick() {
  if (held.value || document.hidden) return
  for (const t of toasts.value) t.left -= STEP
  if (toasts.value.some(t => t.left <= 0)) toasts.value = toasts.value.filter(t => t.left > 0)
}
watch(() => toasts.value.length, (count) => {
  // ds-latency: the toasts' own clock, off the input path; nothing waits on it.
  if (count && !timer) timer = setInterval(tick, STEP)
  if (!count) {
    clearInterval(timer)
    timer = undefined
    held.value = false
  }
}, { immediate: true })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div data-ds="toaster" class="ds-toasts" role="status" aria-live="polite" @pointerenter="held = true" @pointerleave="held = false">
    <TransitionGroup name="ds-toast">
      <p v-for="t in toasts" :key="t.id" class="ds-toast">
        <Check :size="12" :stroke-width="2" aria-hidden="true" class="shrink-0" />
        <span class="shrink-0">{{ t.text }}</span>
        <span v-if="t.detail" class="min-w-0 truncate type-code-sm">{{ t.detail }}</span>
      </p>
    </TransitionGroup>
  </div>
</template>

<style>
.ds-toasts { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 70; display: flex; width: min(320px, calc(100vw - 32px)); flex-direction: column; align-items: flex-end; gap: var(--ds-space-md); pointer-events: none; }
.ds-toast { display: flex; max-width: 100%; min-height: var(--ds-size-control-lg); align-items: center; gap: var(--ds-space-md); padding: 8px 12px; background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-size: var(--ds-text-meta); line-height: 20px; pointer-events: auto; }
.ds-toast-move { transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-toast-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-toast-leave-active { position: absolute; transition: opacity var(--ds-duration-fade) ease-out; }
.ds-toast-enter-from, .ds-toast-leave-to { opacity: 0; }
.ds-toast-enter-from { transform: translateY(8px); }
@media (prefers-reduced-motion: reduce) {
  .ds-toast-move { transition: none; }
  .ds-toast-enter-from { transform: none; }
}
</style>
