<script setup lang="ts">
// Several lines of text (main.css textarea.c-input, square under the console): 13px on 20px lines, 6px 12px inside, a
// #C3C1BF hairline that darkens on hover and turns to a 2px ink edge on focus (the text does not move), a red edge when
// invalid. Grows by hand downward only. 16px on phones, so iOS does not zoom. Put it in a Field for its label and hint.
defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
defineProps<{ invalid?: boolean, rows?: number }>()
</script>

<template>
  <textarea v-model="model" v-bind="$attrs" :rows="rows ?? 4" :aria-invalid="invalid || undefined" class="ds-textarea" />
</template>

<style>
.ds-textarea { display: block; width: 100%; min-height: var(--ds-size-control-md); padding: 6px 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); resize: vertical; transition: border-color var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-textarea::placeholder { color: var(--ds-color-fg-muted); }
@media (hover: hover) and (pointer: fine) { .ds-textarea:hover:not(:disabled, :focus) { border-color: var(--ds-color-neutral-500); } }
.ds-textarea:focus { padding: calc(6px - 1px) calc(12px - 1px); border: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline: none; }
.ds-textarea[aria-invalid="true"] { border-color: var(--ds-color-action-danger); }
.ds-textarea:disabled { border-color: var(--ds-color-edge); color: var(--ds-color-fg-muted); cursor: not-allowed; }
@media (pointer: coarse), (max-width: 767px) { .ds-textarea { font-size: var(--ds-text-input); line-height: var(--ds-text-input-leading); } }
</style>
