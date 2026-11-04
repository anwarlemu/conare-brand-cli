<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { useCopy } from '@/composables/useCopy'

// The copy button beside a value, a new key or an endpoint (the console's Copy.vue, version 2 "Copy to Copied", the
// one picked): the console's secondary button. The label swaps in place, Copy leaving up and Copied coming up from
// below, and the check draws its stroke; the width is the longer word's, so nothing moves.
const props = withDefaults(defineProps<{ text: string, label?: string }>(), { label: 'Copy' })
const emit = defineEmits<{ copied: [] }>()
const { copied, copy } = useCopy()
async function run() {
  if (await copy(props.text)) emit('copied')
}
</script>

<template>
  <button type="button" class="ds-copy" :data-done="copied || undefined" @click="run">
    <span class="ds-copy-icon" :data-state="copied ? 'b' : 'a'" aria-hidden="true">
      <Copy class="ds-copy-a" :size="12" :stroke-width="1.5" />
      <svg class="ds-copy-b ds-copy-check" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 9 17 20 6" pathLength="1" /></svg>
    </span>
    <span class="ds-copy-word"><span :data-on="!copied || undefined" :aria-hidden="copied">{{ label }}</span><span :data-on="copied || undefined" :aria-hidden="!copied">Copied</span></span>
  </button>
</template>

<style>
.ds-copy { display: inline-flex; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; justify-content: center; gap: var(--ds-space-sm); padding: 0 10px; border: var(--ds-border-hairline) solid var(--ds-color-action-secondary-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); white-space: nowrap; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-copy:hover { border-color: var(--ds-color-action-secondary-edge-hover); } }
.ds-copy:active { background: var(--ds-color-surface-subtle); }
.ds-copy:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
.ds-copy-icon { display: inline-grid; }
.ds-copy-icon > * { grid-area: 1 / 1; transition: opacity var(--ds-duration-morph) ease-in-out, filter var(--ds-duration-morph) ease-in-out, transform var(--ds-duration-morph) ease-in-out; }
.ds-copy-icon[data-state="a"] .ds-copy-b, .ds-copy-icon[data-state="b"] .ds-copy-a { opacity: 0; filter: blur(4px); transform: scale(0.25); }
.ds-copy-word { display: inline-grid; }
.ds-copy-word > * { grid-area: 1 / 1; transition: opacity var(--ds-duration-swap) ease-in-out, filter var(--ds-duration-swap) ease-in-out, transform var(--ds-duration-swap) ease-in-out; }
.ds-copy-word > :not([data-on]) { opacity: 0; filter: blur(2px); }
.ds-copy-word > :first-child:not([data-on]) { transform: translateY(-4px); }
.ds-copy-word > :last-child:not([data-on]) { transform: translateY(4px); }
.ds-copy-check path { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset var(--ds-duration-draw) var(--ds-easing-out) 60ms; }
.ds-copy[data-done] .ds-copy-check path { stroke-dashoffset: 0; }
@media (pointer: coarse), (max-width: 767px) { .ds-copy { height: var(--ds-size-control-touch); font-size: var(--ds-text-ui); } }
@media (prefers-reduced-motion: reduce) {
  .ds-copy-icon > *, .ds-copy-word > * { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-copy-check path { transition: none; }
}
</style>
