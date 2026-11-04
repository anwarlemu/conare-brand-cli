<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Check, Search, X } from 'lucide-vue-next'
import type { AccuracyRow, AccuracyView } from '@/components/product/AccuracyDetail.vue'
import AccuracyThumb from '@/components/product/AccuracyThumb.vue'
import Button from '@/components/ui/Button.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import PixelButton from '@/components/ui/PixelButton.vue'

// Accuracy, "Test at work" (accuracy/AtWork.vue, the version that ships): the website's benchmarks on the team's own
// questions. Four tiles in the double rule carry the results and filter the list on a click (a 2px red line runs across
// the picked one). Beside the list, a dark window holds a hundred squares, one a question, red where Conare reached the
// right page and hollow where it missed. Pointing at a question, in the list or on the field, glides a block to its row
// and a bracket to its square, and the window shows what each search handed back. The block follows the pointer at
// once; the window waits 80ms for it to rest, so a pointer crossing to the window's buttons changes nothing.
type Show = 'all' | 'current' | 'differ' | 'look'
const props = defineProps<{ view: AccuracyView }>()
const emit = defineEmits<{ fix: [row: AccuracyRow], search: [row: AccuracyRow], remove: [row: AccuracyRow] }>()
const show = ref<Show>('all')
const rows = computed(() => props.view.rows)
const lists = computed<Record<Show, AccuracyRow[]>>(() => ({
  all: rows.value,
  current: rows.value.filter(r => !r.current.ok),
  differ: rows.value.filter(r => r.conare.ok !== r.current.ok),
  look: rows.value.filter(r => !r.conare.ok),
}))
const list = computed(() => lists.value[show.value])
const inList = computed(() => new Set(list.value.map(r => r.id)))
const tiles = computed(() => [
  { id: 'all' as Show, label: 'Conare', value: props.view.right, of: props.view.questions, line: 'reached the right page' },
  { id: 'current' as Show, label: props.view.current_name, value: props.view.current_right, of: props.view.questions, line: 'reached the right page' },
  { id: 'differ' as Show, label: 'Where they differ', value: lists.value.differ.length, of: 0, line: props.view.right >= props.view.current_right ? `Conare is ahead by ${props.view.right - props.view.current_right}` : 'Your search is ahead' },
  { id: 'look' as Show, label: 'To look at', value: lists.value.look.length, of: 0, line: lists.value.look.length ? 'each with its fix' : 'nothing left to fix' },
])

const running = computed(() => props.view.state === 'running')
const pickedId = ref('')
const picked = computed(() => (running.value ? rows.value.at(-1) : rows.value.find(r => r.id === pickedId.value)) ?? list.value[0] ?? rows.value[0] ?? null)
const shown = ref(12)
watch(show, () => { pickedId.value = list.value[0]?.id ?? ''; shown.value = 12 })
const pick = (row: AccuracyRow) => { pickedId.value = row.id }

// The list's block (the glide mark): one block for the whole list, gliding to the row pointed at or picked.
const listEl = ref<HTMLElement | null>(null)
const mark = ref<{ y: number, h: number } | null>(null)
const markShown = ref(false)
const markInstant = ref(true)
function moveTo(i: number | null) {
  const el = i == null ? null : listEl.value?.querySelectorAll<HTMLElement>('[data-glide-row]')[i]
  if (!el) {
    markShown.value = false
    return
  }
  markInstant.value = !markShown.value
  mark.value = { y: el.offsetTop, h: el.offsetHeight }
  markShown.value = true
}
const restAt = () => {
  const i = list.value.slice(0, shown.value).findIndex(r => r.id === picked.value?.id)
  return i < 0 ? null : i
}
let resting: ReturnType<typeof setTimeout> | undefined
function onRow(row: AccuracyRow, i: number, event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  moveTo(i)
  clearTimeout(resting)
  // ds-latency: the window waits for the pointer to rest on a row; the block under it moved at once.
  resting = setTimeout(() => pick(row), 80)
}
function offList() {
  clearTimeout(resting)
  moveTo(restAt())
}
watch([() => picked.value?.id, show, shown, () => rows.value.length], () => nextTick(() => moveTo(restAt())), { immediate: true })
onBeforeUnmount(() => clearTimeout(resting))

// The field, twenty squares to a row, with a crosshair and a bracket on the question on show.
const COLS = 20
const cells = computed(() => [...rows.value.map(r => ({ id: r.id, ok: r.conare.ok, queued: false })), ...props.view.queued.map(q => ({ id: q.id, ok: false, queued: true }))])
const at = computed(() => Math.max(0, cells.value.findIndex(c => c.id === picked.value?.id)))
const pitch = (n: number) => `calc(${n} * (100cqw + 4px) / ${COLS})`
const half = `(100cqw + 4px) / ${COLS * 2} - 2px`
const scope = computed(() => ({ c: at.value % COLS, r: Math.floor(at.value / COLS) }))
const rowAt = (event: Event) => rows.value.find(r => r.id === (event.target as HTMLElement).dataset.id)
function pointField(event: PointerEvent) {
  const row = rowAt(event)
  if (row && event.pointerType === 'mouse' && inList.value.has(row.id)) pick(row)
}
async function clickField(event: MouseEvent) {
  const row = rowAt(event)
  if (!row) return
  if (!inList.value.has(row.id)) {
    show.value = 'all'
    await nextTick()
  }
  pick(row)
  const i = list.value.findIndex(r => r.id === row.id)
  if (i >= shown.value) shown.value = i + 1
}

// On a narrow page the window sits above the list, so a tap takes you to it.
const panel = ref<HTMLElement | null>(null)
function tap(row: AccuracyRow) {
  pick(row)
  if (matchMedia('(max-width: 1023px)').matches) panel.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
const split = (text: string, key: string) => {
  const i = text.indexOf(key)
  return i < 0 ? [text, '', ''] : [text.slice(0, i), key, text.slice(i + key.length)]
}
const answers = computed(() => (picked.value ? [{ id: 'current', label: props.view.current_name, hit: picked.value.current }, { id: 'conare', label: 'Conare', hit: picked.value.conare }] : []))
</script>

<template>
  <section class="m-1.25 grid grid-cols-4 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge max-lg:grid-cols-2" aria-label="results">
    <button v-for="t in tiles" :key="t.id" type="button" class="ds-testtile" :aria-pressed="show === t.id" :data-red="t.id === 'look' && t.value > 0 || undefined" @click="show = t.id">
      <span class="block type-meta">{{ t.label }}</span>
      <span class="ds-testtile-num">{{ t.value }}<span v-if="t.of" class="ds-testtile-of"> of {{ t.of }}</span></span>
      <span class="block type-meta">{{ t.line }}</span>
    </button>
  </section>

  <div class="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1">
    <div ref="listEl" class="relative flex min-w-0 flex-col" @pointerleave="offList">
      <span v-if="mark" class="ds-glidemark" :data-shown="markShown || undefined" :data-instant="markInstant || undefined" :style="{ transform: `translateY(${mark.y}px)`, height: `${mark.h}px` }" aria-hidden="true" />
      <p v-if="!list.length" class="px-3 py-3 type-meta text-fg-muted">No questions here.</p>
      <p v-else class="flex items-center gap-3 border-b border-edge px-3 pb-2 type-meta text-fg-muted" aria-hidden="true"><span class="flex-1">Question</span><span class="ds-testmarks"><span>Current</span><span>Conare</span></span></p>
      <button
        v-for="(r, i) in list.slice(0, shown)"
        :key="r.id"
        type="button"
        data-glide-row
        class="ds-testrow"
        :aria-current="picked?.id === r.id || undefined"
        @pointerenter="onRow(r, i, $event)"
        @focus="pick(r)"
        @click="tap(r)"
      >
        <span class="min-w-0 flex-1 truncate max-sm:whitespace-normal">{{ r.question }}</span>
        <span class="ds-testmarks" aria-hidden="true">
          <span :data-ok="r.current.ok || undefined"><Check v-if="r.current.ok" :size="12" :stroke-width="2" /><X v-else :size="12" :stroke-width="2" /></span>
          <span :data-ok="r.conare.ok || undefined"><Check v-if="r.conare.ok" :size="12" :stroke-width="2" /><X v-else :size="12" :stroke-width="2" /></span>
        </span>
        <span class="sr-only">{{ view.current_name }}: {{ r.current.ok ? 'right page' : 'wrong page' }}. Conare: {{ r.conare.ok ? 'right page' : 'wrong page' }}.</span>
      </button>
      <Button v-if="shown < list.length" variant="ghost" press class="mt-2 self-start" @click="shown += 12">Show 12 more</Button>
    </div>

    <section ref="panel" class="ds-testpanel m-1.25" aria-label="the question on show">
      <div class="relative w-full border border-code-edge bg-code text-code-fg">
        <div class="flex h-11 items-center gap-2 px-4 text-ui leading-4">
          <span class="size-2 shrink-0 bg-surface-accent" aria-hidden="true" />
          <span class="truncate">Your test</span>
          <span class="shrink-0 bg-code-raised px-1.5 py-0.5 type-meta tabular-nums">{{ running ? `${view.done} of ${view.questions}` : `${view.questions} questions` }}</span>
        </div>
        <div class="ds-testfield" role="img" :aria-label="`${view.right} of ${view.questions} questions reached the right page`" @pointermove="pointField" @click="clickField">
          <span v-for="(c, i) in cells" :key="c.id" class="ds-testcell" :data-id="c.id" :data-ok="c.ok || undefined" :data-queued="c.queued || undefined" :data-dim="!c.queued && !inList.has(c.id) || undefined" :style="{ '--r': Math.floor(i / COLS) }" />
          <span v-if="picked" class="ds-testline" data-h aria-hidden="true" :style="{ transform: `translateY(calc(${pitch(scope.r)} + ${half}))` }" />
          <span v-if="picked" class="ds-testline" data-v aria-hidden="true" :style="{ transform: `translateX(calc(${pitch(scope.c)} + ${half}))` }" />
          <svg v-if="picked" class="ds-bracket" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" :style="{ transform: `translate(${pitch(scope.c)}, ${pitch(scope.r)})` }"><path d="M0 34V0H34M66 0H100V34M100 66V100H66M34 100H0V66" vector-effect="non-scaling-stroke" /></svg>
        </div>
        <div class="grid min-h-85 border-t border-code-edge max-lg:min-h-0">
          <Transition name="ds-winswap">
            <div v-if="picked" :key="running ? 'run' : picked.id" class="ds-testswap">
              <p class="bg-code-raised px-3 py-2 text-ui">{{ picked.question }}</p>
              <p v-if="running" class="flex items-center gap-2 text-ui text-code-muted"><DotMatrix tone="inverse" />Searching your data</p>
              <template v-else>
                <div v-for="a in answers" :key="a.id" class="ds-testanswer">
                  <AccuracyThumb :number="a.hit.number" :top="a.hit.top" />
                  <div class="min-w-0 flex-1">
                    <p class="flex items-center justify-between gap-3 type-meta text-code-muted"><span>{{ a.label }}</span><span class="ds-testverdict" :data-ok="a.hit.ok || undefined">{{ a.hit.ok ? 'Right page' : 'Wrong page' }}</span></p>
                    <p class="mt-1 text-ui text-code-muted">{{ split(a.hit.text, a.hit.key)[0] }}<strong class="font-medium text-code-fg">{{ split(a.hit.text, a.hit.key)[1] }}</strong>{{ split(a.hit.text, a.hit.key)[2] }}</p>
                    <p class="mt-1 flex justify-between gap-3 type-meta text-code-muted"><span class="truncate">{{ a.hit.id }}</span><span class="shrink-0">Page {{ a.hit.number }} of {{ a.hit.count }}</span></p>
                  </div>
                </div>
                <p v-if="picked.fix" class="text-ui">{{ picked.fix.why }}</p>
                <div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                  <PixelButton v-if="picked.fix" @click="emit('fix', picked)">{{ picked.fix.action }}</PixelButton>
                  <button type="button" class="ds-testlink" @click="emit('search', picked)"><Search :size="12" :stroke-width="1.5" aria-hidden="true" />Search it</button>
                  <button type="button" class="ds-testlink" @click="emit('remove', picked)">Remove question</button>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.ds-testtile { position: relative; display: flex; min-width: 0; flex-direction: column; gap: var(--ds-space-xs); padding: 16px; background: var(--ds-color-surface); color: var(--ds-color-fg-muted); text-align: left; cursor: pointer; touch-action: manipulation; transition: background-color var(--ds-duration-enter) var(--ds-easing-standard), color var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-testtile::before { position: absolute; inset: 0 0 auto; height: 2px; background: var(--ds-color-surface-accent); content: ""; transform: scaleX(0); transform-origin: left; transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-testtile[aria-pressed="true"] { background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); }
.ds-testtile[aria-pressed="true"]::before { transform: scaleX(1); }
.ds-testtile:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
.ds-testtile:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-testtile-num { display: block; margin-top: 16px; color: var(--ds-color-fg); font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-1); line-height: var(--ds-text-heading-1-leading); letter-spacing: var(--ds-tracking-display); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ds-testtile-of { font-size: var(--ds-text-heading-4); letter-spacing: 0; }
.ds-testtile[data-red] .ds-testtile-num { color: var(--ds-color-fg-accent); }
.ds-testmarks { display: flex; flex-shrink: 0; }
.ds-testmarks > span { display: inline-flex; width: 56px; justify-content: center; color: var(--ds-color-fg-accent); }
.ds-testmarks > span[data-ok] { color: var(--ds-color-fg); }
p > .ds-testmarks > span { color: inherit; }
.ds-glidemark { position: absolute; top: 0; right: 0; left: 0; border-left: 2px solid var(--ds-color-edge-accent); background: var(--ds-color-surface-subtle); opacity: 0; pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-out), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-glidemark[data-shown] { opacity: 1; }
.ds-glidemark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-testrow { position: relative; display: flex; width: 100%; min-height: 40px; align-items: center; gap: var(--ds-space-lg); padding: 8px 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); line-height: 20px; text-align: left; cursor: pointer; touch-action: manipulation; }
.ds-testrow:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-testpanel { position: sticky; top: 64px; display: flex; min-height: 480px; align-items: flex-start; padding: 24px; overflow: hidden; outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; background: var(--ds-color-code-raised); }
.ds-testfield { position: relative; display: grid; grid-template-columns: repeat(20, minmax(0, 1fr)); gap: var(--ds-space-xs); margin: 4px 16px 16px; container-type: inline-size; cursor: crosshair; touch-action: manipulation; }
.ds-testcell { aspect-ratio: 1; border: var(--ds-border-hairline) solid var(--ds-color-code-muted); transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-testcell[data-ok] { border-color: var(--ds-color-surface-accent); background: var(--ds-color-surface-accent); }
.ds-testcell[data-queued] { border-color: var(--ds-color-code-edge); background: var(--ds-color-code-edge); }
.ds-testcell[data-dim] { opacity: 0.24; }
@media (prefers-reduced-motion: no-preference) {
  .ds-testcell { animation: ds-testcell var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--r) * 40ms); }
}
@keyframes ds-testcell { from { opacity: 0; transform: scale(0.9); } }
.ds-testline { position: absolute; top: 0; left: 0; background: var(--ds-color-code-fg); opacity: 0.24; pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-testline[data-h] { right: 0; height: 1px; }
.ds-testline[data-v] { bottom: 0; width: 1px; }
.ds-bracket { position: absolute; top: -2px; left: -2px; width: calc((100cqw + 4px) / 20); height: calc((100cqw + 4px) / 20); overflow: visible; color: var(--ds-color-code-fg); pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-bracket path { fill: none; stroke: currentColor; stroke-width: 1.5; }
.ds-testswap { display: flex; min-width: 0; flex-direction: column; gap: var(--ds-space-lg); padding: 16px; grid-area: 1 / 1; }
.ds-winswap-enter-active { transition: opacity var(--ds-duration-fade) var(--ds-easing-out), filter var(--ds-duration-fade) var(--ds-easing-out); }
.ds-winswap-leave-active { transition: opacity var(--ds-duration-swap-out) var(--ds-easing-out); }
.ds-winswap-enter-from { opacity: 0; filter: blur(2px); }
.ds-winswap-leave-to { opacity: 0; }
.ds-testanswer { display: flex; align-items: flex-start; gap: var(--ds-space-lg); }
.ds-testanswer + .ds-testanswer { padding-top: 12px; border-top: var(--ds-border-hairline) solid var(--ds-color-code-edge); }
.ds-testverdict { display: inline-flex; flex-shrink: 0; align-items: center; gap: var(--ds-space-sm); }
.ds-testverdict::before { width: 6px; height: 6px; border: var(--ds-border-hairline) solid var(--ds-color-code-muted); content: ""; }
.ds-testverdict[data-ok] { color: var(--ds-color-code-fg); }
.ds-testverdict[data-ok]::before { border-color: var(--ds-color-surface-accent); background: var(--ds-color-surface-accent); }
.ds-testlink { display: inline-flex; min-height: 28px; align-items: center; gap: var(--ds-space-sm); color: var(--ds-color-code-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-testlink:hover { color: var(--ds-color-code-fg); } }
.ds-testlink:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 2px; }
@media (max-width: 1023px) {
  .ds-testpanel { position: relative; top: auto; order: -1; min-height: 0; padding: 12px; scroll-margin-top: 64px; }
}
@media (max-width: 767px) {
  .ds-testtile { padding: 12px; }
  .ds-testtile-num { font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); }
  .ds-testtile-of { font-size: var(--ds-text-body); }
  .ds-testfield { margin-inline: 12px; }
  .ds-testswap { padding: 12px; }
  .ds-testmarks > span { width: 48px; }
}
@media (pointer: coarse), (max-width: 767px) { .ds-testrow { min-height: 44px; } .ds-testlink { min-height: 40px; } }
@media (prefers-reduced-motion: reduce) {
  .ds-glidemark, .ds-testline, .ds-bracket { transition: none; }
  .ds-winswap-enter-from { filter: none; }
}
</style>
