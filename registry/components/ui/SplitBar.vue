<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

// A whole in parts, as Billing's prices draw it (the chart's Split example): one bar, the parts in the order given
// (largest first), the picked part in ink with a red mark gliding over it; under it the parts as rows in a card, one
// paper block gliding to the row under the pointer or focus, and a red square on the picked row. Pointing at a row
// picks it (v-model). `detail` is a quiet middle column, hidden on phones; `display` is the value as written.
export type SplitPart = { name: string, value: number, display?: string, detail?: string }
const props = defineProps<{ parts: SplitPart[], label?: string }>()
const at = defineModel<number>({ default: 0 })

const total = computed(() => props.parts.reduce((a, p) => a + p.value, 0) || 1)
// The parts share what the bar's 2px gaps leave, so those come out of the percent.
const center = computed(() => {
  const n = props.parts.length
  const i = Math.min(at.value, n - 1)
  const middle = (props.parts.slice(0, i).reduce((a, p) => a + p.value, 0) + (props.parts[i]?.value ?? 0) / 2) / total.value
  return `calc(${middle * 100}% + ${i * 2 - middle * 2 * (n - 1)}px)`
})

// The gliding block: placed at once the first time, then it glides on transform.
const list = ref<HTMLElement | null>(null)
const mark = ref<{ y: number, h: number } | null>(null)
const instant = ref(true)
function place(i: number) {
  const row = list.value?.querySelectorAll<HTMLElement>('[data-glide-row]')[i]
  if (!row) return
  instant.value = !mark.value
  mark.value = { y: row.offsetTop, h: row.offsetHeight }
}
function pick(i: number) {
  at.value = i
  place(i)
}
onMounted(() => nextTick(() => place(at.value)))
watch(at, i => place(i))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="ds-segmark-track" aria-hidden="true"><span class="ds-segmark" :style="{ transform: `translateX(${center})` }"><i /></span></div>
    <div class="ds-splitbar" aria-hidden="true">
      <span v-for="(p, i) in parts" :key="p.name" :data-on="at === i || undefined" :style="{ flexGrow: p.value / total }" />
    </div>
    <ul ref="list" class="relative border border-edge bg-surface" :aria-label="label">
      <span v-if="mark" class="ds-rowmark" :data-instant="instant || undefined" :style="{ transform: `translateY(${mark.y}px)`, height: `${mark.h}px` }" aria-hidden="true" />
      <li v-for="(p, i) in parts" :key="p.name" data-glide-row class="border-edge [&+&]:border-t">
        <button type="button" class="ds-priced" :data-on="at === i || undefined" :aria-pressed="at === i" @pointerenter="pick(i)" @focus="pick(i)" @click="pick(i)">
          <span class="min-w-0 flex-1 truncate text-left">{{ p.name }}</span>
          <span v-if="p.detail" class="hidden text-fg-muted tabular-nums sm:inline">{{ p.detail }}</span>
          <span class="w-24 text-right tabular-nums">{{ p.display ?? p.value.toLocaleString('en-US') }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style>
/* console2.css .v2-splitbar, .v2-segmark, .v2-rowmark and .v2-priced, as Billing's prices set them (data-pm="6"). */
.ds-splitbar { display: flex; height: 12px; gap: var(--ds-space-2xs); margin-top: var(--ds-space-xs); }
.ds-splitbar > span { flex-basis: 0; background: var(--ds-color-neutral-600); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-splitbar > span[data-on] { background: var(--ds-color-surface-inverse); }
.ds-segmark-track { position: relative; height: 8px; margin-bottom: -12px; overflow: clip; }
.ds-segmark { position: absolute; inset: 0; transition: transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-segmark i { position: absolute; top: 0; left: -3px; width: 6px; height: 6px; background: var(--ds-color-edge-accent); }
.ds-rowmark { position: absolute; top: 0; right: 0; left: 0; z-index: 0; background: var(--ds-color-surface-subtle); pointer-events: none; transition: transform var(--ds-duration-enter) var(--ds-easing-out), height var(--ds-duration-enter) var(--ds-easing-out); }
.ds-rowmark[data-instant] { transition: none; }
.ds-priced { position: relative; z-index: 1; display: flex; width: 100%; min-height: var(--ds-size-row); align-items: center; gap: var(--ds-space-xl); padding: 0 16px 0 20px; font-size: var(--ds-text-ui); cursor: pointer; }
.ds-priced::before { position: absolute; top: 50%; left: 8px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-priced[data-on]::before { opacity: 1; }
.ds-priced:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
@media (prefers-reduced-motion: reduce) { .ds-splitbar > span, .ds-segmark, .ds-rowmark { transition: none; } }
</style>
