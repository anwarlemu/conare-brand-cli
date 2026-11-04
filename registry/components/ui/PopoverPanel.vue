<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PopoverController } from '@/composables/usePopover'

// The floating panel every overlay draws (usePopover places it): portalled to the body, fixed where it fits, Menu's
// square panel in a hairline with no shadow. It grows from its anchor, 4px and a touch of scale, over 200ms on the
// strong ease-out, and leaves in 120ms; opened or closed from the keyboard it does neither. `tip` is the tooltip's
// inverse fill, 2px over 125ms. Reduced motion keeps the fade. Class and attributes land on the panel.
defineOptions({ inheritAttrs: false })
defineProps<{ pop: PopoverController, tip?: boolean }>()
// Rendered after mount, so the server and the first client render agree.
const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>

<template>
  <Teleport v-if="mounted" :to="pop.target.value">
    <Transition name="ds-pop" :css="!pop.instant.value">
      <div
        v-if="pop.open.value"
        v-bind="$attrs"
        :ref="(el) => { pop.panel.value = el as HTMLElement | null }"
        class="ds-pop"
        :data-tip="tip || undefined"
        :data-side="pop.pos.side"
        :data-instant="pop.instant.value || undefined"
        :data-placed="pop.pos.placed || undefined"
        :style="{ left: `${pop.pos.x}px`, top: `${pop.pos.y}px`, transformOrigin: pop.pos.origin, minWidth: pop.pos.minWidth ? `${pop.pos.minWidth}px` : undefined }"
        @focusout="pop.onFocusOut"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.ds-pop { position: fixed; z-index: 60; max-width: calc(100vw - 16px); max-height: calc(100vh - 16px); overflow: auto; overscroll-behavior: contain; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); text-align: left; outline: none; }
.ds-pop:not([data-placed]) { visibility: hidden; }
.ds-pop[data-tip] { z-index: 70; overflow: visible; padding: 2px 6px; border-color: var(--ds-color-surface-inverse); background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; pointer-events: none; }
.ds-pop-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-pop-leave-active { transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-standard); }
.ds-pop-enter-from, .ds-pop-leave-to { opacity: 0; }
.ds-pop-enter-from[data-side="bottom"], .ds-pop-leave-to[data-side="bottom"] { transform: translateY(-4px) scale(0.98); }
.ds-pop-enter-from[data-side="top"], .ds-pop-leave-to[data-side="top"] { transform: translateY(4px) scale(0.98); }
.ds-pop-enter-from[data-side="right"], .ds-pop-leave-to[data-side="right"] { transform: translateX(-4px) scale(0.98); }
.ds-pop-enter-from[data-side="left"], .ds-pop-leave-to[data-side="left"] { transform: translateX(4px) scale(0.98); }
.ds-pop[data-tip].ds-pop-enter-active, .ds-pop[data-tip].ds-pop-leave-active { transition: opacity var(--ds-duration-tip) var(--ds-easing-out), transform var(--ds-duration-tip) var(--ds-easing-out); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="bottom"], .ds-pop[data-tip].ds-pop-leave-to[data-side="bottom"] { transform: translateY(-2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="top"], .ds-pop[data-tip].ds-pop-leave-to[data-side="top"] { transform: translateY(2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="right"], .ds-pop[data-tip].ds-pop-leave-to[data-side="right"] { transform: translateX(-2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="left"], .ds-pop[data-tip].ds-pop-leave-to[data-side="left"] { transform: translateX(2px); }
.ds-pop[data-instant].ds-pop-enter-active, .ds-pop[data-instant].ds-pop-leave-active { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-pop.ds-pop-enter-from, .ds-pop.ds-pop-leave-to { transform: none; }
}
</style>
