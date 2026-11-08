<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, Trash2 } from 'lucide-vue-next'

// A destructive action (revoke a key, disconnect a source) confirmed in the button itself, never in a dialog: the
// console's pixel hold (console2.css .v2-hold, version 1). Pressing and holding fills the button with the website's
// red 6px squares from the left over `ms`; each column carries a white copy of the label, so it turns as the squares
// land; the bin's lid lifts while held; letting go rewinds right to left in under 200ms; at the end the check draws
// and holds a beat before `confirm` is emitted. The label rolls up to "Hold" under the pointer. Space or Enter hold
// it from the keyboard. Set `done` back to false (by re-keying) if what it confirmed failed.
const props = withDefaults(defineProps<{ label: string, ms?: number }>(), { ms: 1000 })
const emit = defineEmits<{ confirm: [] }>()

const root = ref<HTMLButtonElement | null>(null)
const holding = ref(false)
const done = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let landing: ReturnType<typeof setTimeout> | undefined

function finish() {
  done.value = true
  holding.value = false
  // ds-latency: the check is seen before what it confirms happens; the press itself answered at once.
  landing = setTimeout(() => emit('confirm'), 320)
}
function start() {
  if (done.value || holding.value) return
  holding.value = true
  // ds-latency: the hold is the confirmation; its length is the point.
  timer = setTimeout(finish, props.ms)
}
function cancel() {
  clearTimeout(timer)
  holding.value = false
}
// Safari takes focus off a button as it is pressed, so losing focus ends a hold only by keyboard.
let pointing = false
function press() { pointing = true; start() }
function release() { pointing = false; cancel() }
function onKeyDown(event: KeyboardEvent) {
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  if (!event.repeat) start()
}
function onKeyUp(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter') cancel()
}
function blur() { if (!pointing) cancel() }
onBeforeUnmount(() => { clearTimeout(timer); clearTimeout(landing) })

// 6px cells across the button as measured, each lighting when the hold reaches its column, with a little scatter.
// --d is the way in; --o the way out, right to left.
const PX = 6
const grid = ref<{ cols: number, w: number, h: number, cells: Array<Record<string, number>> } | null>(null)
function lay() {
  const el = root.value
  if (!el) return
  const w = el.offsetWidth
  const h = el.offsetHeight
  if (grid.value?.w === w && grid.value.h === h) return
  const cols = Math.ceil(w / PX)
  const rows = Math.ceil(h / PX)
  grid.value = {
    cols,
    w,
    h,
    cells: Array.from({ length: cols * rows }, (_, k) => {
      const col = k % cols
      const scatter = ((k * 37) % 11) / 11
      const at = (col + scatter) / cols
      return { '--d': Math.round(at * props.ms * 0.94), '--o': Math.round((1 - at) * 120) }
    }),
  }
}
const inks = computed(() => {
  const g = grid.value
  if (!g) return []
  return Array.from({ length: g.cols }, (_, c) => ({ col: g.cells[c]!, ink: { width: `${g.w}px`, height: `${g.h}px`, transform: `translateX(${-c * PX}px)` } }))
})
let ro: ResizeObserver | undefined
onMounted(() => {
  lay()
  ro = new ResizeObserver(lay)
  if (root.value) ro.observe(root.value)
})
onBeforeUnmount(() => ro?.disconnect())
const verb = computed(() => props.label.toLowerCase())
</script>

<template>
  <button data-ds="hold-button"
    ref="root"
    type="button"
    class="ds-hold"
    :data-holding="holding || undefined"
    :data-done="done || undefined"
    :aria-label="`hold to ${verb}`"
    @pointerdown="press"
    @pointerup="release"
    @pointerleave="release"
    @pointercancel="release"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @blur="blur"
    @contextmenu.prevent
  >
    <template v-if="grid">
      <span class="ds-hold-px" aria-hidden="true" :style="{ gridTemplateColumns: `repeat(${grid.cols}, ${PX}px)` }"><i v-for="(c, k) in grid.cells" :key="k" :style="c" /></span>
      <span class="ds-hold-inks" aria-hidden="true" :style="{ gridTemplateColumns: `repeat(${grid.cols}, ${PX}px)` }">
        <i v-for="(c, k) in inks" :key="k" :style="c.col"><span class="ds-hold-ink" :style="c.ink"><Trash2 :size="12" :stroke-width="1.5" /><span class="ds-hold-word"><span class="invisible">{{ label }}</span><span class="absolute inset-x-0">Hold</span></span></span></i>
      </span>
      <span class="ds-hold-done" aria-hidden="true"><Check :size="12" :stroke-width="2" />Done</span>
    </template>
    <span class="ds-hold-label"><Trash2 :size="12" :stroke-width="1.5" aria-hidden="true" />
      <span class="ds-roll"><span class="ds-roll-a">{{ label }}</span><span class="ds-roll-b" aria-hidden="true">Hold</span></span>
    </span>
  </button>
</template>

<style>
.ds-hold {
  position: relative;
  display: inline-flex;
  height: var(--ds-size-control-sm);
  min-width: 92px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-sm);
  overflow: hidden;
  padding: 0 10px;
  border: var(--ds-border-hairline) solid var(--ds-color-action-danger);
  background: var(--ds-color-surface);
  color: var(--ds-color-action-danger);
  font-size: var(--ds-text-meta);
  font-weight: var(--ds-font-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  will-change: transform;
  transition: transform var(--ds-duration-enter) var(--ds-easing-out), border-color var(--ds-duration-micro) var(--ds-easing-standard);
}
.ds-hold[data-holding] { transform: scale(0.97); transition-duration: var(--ds-duration-micro); }
.ds-hold-label { position: relative; display: inline-flex; align-items: center; gap: var(--ds-space-sm); }
.ds-hold .lucide-trash-2 path:nth-last-child(-n + 2) { transform-box: fill-box; transform-origin: 0% 100%; transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-hold[data-holding] .lucide-trash-2 path:nth-last-child(-n + 2) { transform: translateY(-1.5px) rotate(-9deg); }
.ds-hold-px { position: absolute; inset: -1px; z-index: 1; display: grid; grid-auto-rows: 6px; pointer-events: none; }
.ds-hold-inks { position: absolute; inset: -1px; z-index: 2; display: grid; pointer-events: none; }
.ds-hold-inks i { position: relative; overflow: hidden; font-style: normal; }
.ds-hold-ink { position: absolute; top: 0; left: 0; display: flex; align-items: center; justify-content: center; gap: var(--ds-space-sm); color: var(--ds-color-off-white); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: 1.4; white-space: nowrap; }
.ds-hold-word { position: relative; display: block; text-align: center; }
.ds-hold-px i { background: var(--ds-color-home-red-press); }
.ds-hold-px i, .ds-hold-inks i { opacity: 0; transition: opacity var(--ds-duration-cell) ease calc(var(--o) * 1ms); }
.ds-hold:is([data-holding], [data-done]) :is(.ds-hold-px, .ds-hold-inks) i { opacity: 1; transition: opacity var(--ds-duration-press) linear calc(var(--d) * 1ms); }
.ds-hold[data-done] :is(.ds-hold-px, .ds-hold-inks) i { transition-duration: 0ms; transition-delay: 0ms; }
.ds-hold-done { position: absolute; inset: -1px; z-index: 3; display: flex; align-items: center; justify-content: center; gap: var(--ds-space-sm); background: var(--ds-color-home-red-press); color: var(--ds-color-off-white); opacity: 0; pointer-events: none; }
.ds-hold-done path { stroke-dasharray: 24; stroke-dashoffset: 24; }
.ds-hold[data-done] .ds-hold-done { opacity: 1; transition: opacity var(--ds-duration-cell) ease; }
.ds-hold[data-done] .ds-hold-done path { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-settle) var(--ds-easing-out) 40ms; }
/* The label rolls up to a copy of itself under the pointer or focus (console2.css .roll). */
.ds-roll { position: relative; display: block; overflow: hidden; line-height: 1.4; }
.ds-roll-a, .ds-roll-b { display: block; transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-roll-b { position: absolute; inset-inline: 0; top: 0; text-align: center; transform: translateY(110%); }
.ds-hold:focus-visible .ds-roll-a { transform: translateY(-110%); }
.ds-hold:focus-visible .ds-roll-b { transform: none; }
@media (hover: hover) and (pointer: fine) {
  .ds-hold:hover .ds-roll-a { transform: translateY(-110%); }
  .ds-hold:hover .ds-roll-b { transform: none; }
}
@media (pointer: coarse), (max-width: 767px) {
  .ds-hold { height: var(--ds-size-control-touch); font-size: var(--ds-text-ui); }
}
@media (prefers-reduced-motion: reduce) {
  .ds-hold, .ds-roll-a, .ds-roll-b, .ds-hold .lucide-trash-2 path { transition: none; }
  .ds-hold[data-holding] { transform: none; }
}
</style>
