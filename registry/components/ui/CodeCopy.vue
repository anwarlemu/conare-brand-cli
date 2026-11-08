<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { useCopy } from '@/composables/useCopy'

// The code window's Copy (the console's CodeCopy.vue): on the dark bar, the icon and the word swap in one cell, so
// nothing moves. Used by CodeBlock; `light` is its form on the paper install line.
defineProps<{ text: string, light?: boolean }>()
const emit = defineEmits<{ copied: [] }>()
const { copied, copy } = useCopy()
async function run(text: string) {
  if (await copy(text)) emit('copied')
}
</script>

<template>
  <button data-ds="code-copy" type="button" class="ds-codecopy" :data-light="light || undefined" @click="run(text)">
    <span class="ds-codecopy-icon" aria-hidden="true"><Copy :data-on="!copied || undefined" :size="12" :stroke-width="1.5" /><Check :data-on="copied || undefined" :size="12" :stroke-width="2" /></span>
    <span class="ds-codecopy-word"><span :data-on="!copied || undefined" :aria-hidden="copied">Copy</span><span :data-on="copied || undefined" :aria-hidden="!copied">Copied</span></span>
    <span class="sr-only" aria-live="polite">{{ copied ? 'copied' : '' }}</span>
  </button>
</template>

<style>
.ds-codecopy { display: inline-flex; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; gap: var(--ds-space-sm); padding: 0 10px; border: var(--ds-border-hairline) solid var(--ds-color-code-edge); background: var(--ds-color-code); color: var(--ds-color-code-fg); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: 20px; cursor: pointer; transition: border-color var(--ds-duration-micro) ease; }
.ds-codecopy:active { background: var(--ds-color-code-raised); }
@media (hover: hover) and (pointer: fine) { .ds-codecopy:hover { border-color: var(--ds-color-off-white); } }
.ds-codecopy:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-surface-accent); outline-offset: -2px; }
.ds-codecopy[data-light] { border-color: var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); }
.ds-codecopy[data-light]:active { background: var(--ds-color-surface-subtle); }
@media (hover: hover) and (pointer: fine) { .ds-codecopy[data-light]:hover { border-color: var(--ds-color-action-secondary-edge-hover); } }
.ds-codecopy-icon, .ds-codecopy-word { display: inline-grid; }
.ds-codecopy-icon > *, .ds-codecopy-word > * { grid-area: 1 / 1; transition: opacity var(--ds-duration-swap) ease-in-out, filter var(--ds-duration-swap) ease-in-out, transform var(--ds-duration-swap) ease-in-out; }
.ds-codecopy-icon > :not([data-on]) { opacity: 0; filter: blur(4px); transform: scale(0.25); }
.ds-codecopy-word > :not([data-on]) { opacity: 0; filter: blur(2px); }
.ds-codecopy-word > :first-child:not([data-on]) { transform: translateY(-4px); }
.ds-codecopy-word > :last-child:not([data-on]) { transform: translateY(4px); }
@media (prefers-reduced-motion: reduce) {
  .ds-codecopy-icon > *, .ds-codecopy-word > * { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
}
</style>
