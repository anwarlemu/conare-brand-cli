<script setup lang="ts">
import { computed, ref } from 'vue'

// A one-time code (new, in the console's grammar): square 32px cells in the #C3C1BF hairline, Geist Mono digits at 16px,
// the cell being typed into ink-edged with a caret, and an optional gap after `split` cells. It is one real input laid
// over the cells, so paste, the phone's code suggestion (autocomplete="one-time-code"), arrows and delete all work as in
// any field. Emits `complete` when every cell is filled. A red edge on every cell when invalid. 40px cells on phones.
const code = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{ length?: number, split?: number, label: string, numeric?: boolean, invalid?: boolean, disabled?: boolean }>(), { length: 6, numeric: true })
const emit = defineEmits<{ complete: [code: string] }>()
const input = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const caret = ref(0)
const cells = computed(() => Array.from({ length: props.length }, (_, i) => code.value[i] ?? ''))
const active = computed(() => (focused.value ? Math.min(caret.value, props.length - 1) : -1))

function sync() {
  const el = input.value
  if (!el) return
  caret.value = el.selectionStart ?? el.value.length
}
// A click lands on the next empty cell, as typing would.
function toEnd() {
  const el = input.value
  if (!el) return
  const end = el.value.length
  el.setSelectionRange(end, end)
  sync()
}
function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const clean = (props.numeric ? el.value.replace(/\D/g, '') : el.value.replace(/\s/g, '')).slice(0, props.length)
  if (clean !== el.value) el.value = clean
  code.value = clean
  sync()
  if (clean.length === props.length) emit('complete', clean)
}
</script>

<template>
  <div class="ds-otp" :data-invalid="invalid || undefined" :data-disabled="disabled || undefined">
    <input
      ref="input"
      :value="code"
      :maxlength="length"
      :inputmode="numeric ? 'numeric' : 'text'"
      :pattern="numeric ? '[0-9]*' : undefined"
      autocomplete="one-time-code"
      spellcheck="false"
      :aria-label="label"
      :aria-invalid="invalid || undefined"
      :disabled="disabled"
      @input="onInput"
      @focus="focused = true; toEnd()"
      @blur="focused = false"
      @keyup="sync"
      @click="toEnd"
    >
    <span v-for="(c, i) in cells" :key="i" class="ds-otp-cell" :data-active="i === active || undefined" :data-gap="split && i === split - 1 && i < length - 1 ? true : undefined" aria-hidden="true">{{ c }}<i v-if="i === active && !c" /></span>
  </div>
</template>

<style>
.ds-otp { position: relative; display: inline-flex; gap: var(--ds-space-sm); }
.ds-otp > input { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; border: 0; background: transparent; color: transparent; caret-color: transparent; font-size: var(--ds-text-input); letter-spacing: 1em; outline: none; cursor: text; }
.ds-otp > input::selection { background: transparent; }
.ds-otp > input:disabled { cursor: not-allowed; }
.ds-otp-cell { position: relative; display: inline-flex; width: var(--ds-size-control-md); height: var(--ds-size-control-md); align-items: center; justify-content: center; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); font-family: var(--ds-font-code); font-size: var(--ds-text-heading-4); transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-otp-cell[data-gap] { margin-right: var(--ds-space-md); }
.ds-otp-cell[data-active] { border-color: var(--ds-color-edge-focus); }
.ds-otp-cell > i { width: 1px; height: 16px; background: var(--ds-color-fg); animation: ds-otp-caret 1000ms steps(1, end) infinite; }
@keyframes ds-otp-caret { 50% { opacity: 0; } }
.ds-otp[data-invalid] .ds-otp-cell { border-color: var(--ds-color-action-danger); }
.ds-otp[data-disabled] .ds-otp-cell { border-color: var(--ds-color-edge); background: var(--ds-color-surface-sunken); color: var(--ds-color-fg-muted); }
@media (pointer: coarse), (max-width: 767px) { .ds-otp-cell { width: var(--ds-size-control-touch); height: var(--ds-size-control-touch); } }
@media (prefers-reduced-motion: reduce) { .ds-otp-cell > i { animation: none; } }
</style>
