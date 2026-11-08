<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { StepState } from '@/composables/useSteps'

// One step (the console's byapi/Step.vue, .v2-movestep): a 44px head with its number in Geist Mono, the title and,
// folded, a line that says what came of it. It opens when it's reached; a finished step folds to that line and opens
// again on a click; a step not reached is dimmed and locked, so the next thing to do is the only open thing. The body
// opens in place: its height on the strong ease-out over 180ms (in 200ms, out 140ms), its content rising 4px.
// `locked`: what's done can't be undone from here, so its line doesn't open. Take states from useSteps().
defineProps<{ n: number, title: string, state: StepState, says?: string, locked?: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <li data-ds="step" class="ds-step" :data-state="state">
    <button type="button" class="ds-step-head" :disabled="state === 'next' || (locked && state !== 'now')" :aria-expanded="state === 'now'" @click="$emit('open')">
      <span class="ds-step-mark" aria-hidden="true"><Check v-if="state === 'done'" :size="12" :stroke-width="2" /><template v-else>{{ n }}</template></span>
      <span class="type-ui-strong">{{ title }}</span>
      <span v-if="says && state !== 'now'" class="ds-step-says">{{ says }}</span>
    </button>
    <Transition name="ds-step" :duration="{ enter: 200, leave: 140 }">
      <div v-if="state === 'now'"><div class="ds-step-grow"><div><div class="ds-step-body"><slot /></div></div></div></div>
    </Transition>
  </li>
</template>

<style>
.ds-step { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-step-head { display: flex; width: 100%; min-height: 44px; align-items: center; gap: var(--ds-space-md); text-align: left; cursor: pointer; touch-action: manipulation; }
.ds-step-head:disabled { cursor: default; }
.ds-step-head:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-step-mark { display: inline-flex; width: 16px; height: 16px; flex-shrink: 0; align-items: center; justify-content: center; color: var(--ds-color-fg-muted); font-family: var(--ds-font-code); font-size: var(--ds-text-meta); line-height: 16px; }
.ds-step[data-state="now"] .ds-step-mark { color: var(--ds-color-fg-accent); }
.ds-step[data-state="done"] .ds-step-mark { color: var(--ds-color-fg); }
.ds-step[data-state="next"] .ds-step-head, .ds-step[data-state="next"] .type-ui-strong { color: var(--ds-color-fg-muted); }
.ds-step-says { min-width: 0; margin-left: auto; overflow: hidden; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); text-overflow: ellipsis; white-space: nowrap; }
.ds-step-body { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-md); padding: 0 0 16px 24px; }
.ds-step-grow { display: grid; grid-template-rows: 1fr; }
.ds-step-grow > div { min-width: 0; min-height: 0; }
:is(.ds-step-enter-from, .ds-step-leave-to) .ds-step-grow { grid-template-rows: 0fr; }
:is(.ds-step-enter-active, .ds-step-leave-active) .ds-step-grow { transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
:is(.ds-step-enter-active, .ds-step-leave-active) .ds-step-grow > div { overflow: hidden; }
.ds-step-enter-active .ds-step-grow > div { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-step-leave-active .ds-step-grow > div { transition: opacity var(--ds-duration-cell) var(--ds-easing-out); }
.ds-step-enter-from .ds-step-grow > div { opacity: 0; transform: translateY(-4px); }
.ds-step-leave-to .ds-step-grow > div { opacity: 0; }
@media (prefers-reduced-motion: reduce) { :is(.ds-step-enter-active, .ds-step-leave-active) :is(.ds-step-grow, .ds-step-grow > div) { transition: none; } }
</style>
