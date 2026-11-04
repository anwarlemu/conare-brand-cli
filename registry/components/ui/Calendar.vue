<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

// A month to pick a day from, in the console's grammar: square 32px day cells (40px on phones) in a hairline-free
// grid, weekday heads in 12px muted, the month in 13px medium between two ghost arrow buttons. The picked day is ink
// on off-white; today carries Menu's 4px red square in its corner; days that can't be picked are muted. Arrows move a
// day or a week, Home and End to the week's ends, Page Up and Page Down a month (with Shift a year), Enter or Space
// picks. Changing month doesn't animate: it is pressed many times in a row.
const props = withDefaults(defineProps<{ label?: string, min?: Date, max?: Date, disabled?: (day: Date) => boolean, weekStartsOn?: 0 | 1, locale?: string }>(), { label: 'calendar', weekStartsOn: 0, locale: 'en-US' })
const model = defineModel<Date | null>({ default: null })
const emit = defineEmits<{ select: [day: Date] }>()

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
function addMonths(d: Date, n: number) {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last))
}

const today = day0(new Date())
const focused = ref(day0(model.value ?? today))
const month = computed(() => new Date(focused.value.getFullYear(), focused.value.getMonth(), 1))
watch(model, (d) => { if (d && !same(d, focused.value)) focused.value = day0(d) })

const caption = computed(() => month.value.toLocaleDateString(props.locale, { month: 'long', year: 'numeric' }))
const weekdays = computed(() => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(2026, 1, 1 + ((i + props.weekStartsOn) % 7)) // 1 February 2026 is a Sunday.
  return { short: d.toLocaleDateString(props.locale, { weekday: 'short' }).slice(0, 2), long: d.toLocaleDateString(props.locale, { weekday: 'long' }) }
}))
const weeks = computed(() => {
  const first = month.value
  const lead = (first.getDay() - props.weekStartsOn + 7) % 7
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = [...Array.from({ length: lead }, () => null), ...Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
})
function blocked(d: Date) {
  return (!!props.min && d < day0(props.min)) || (!!props.max && d > day0(props.max)) || !!props.disabled?.(d)
}
const dayLabel = (d: Date) => d.toLocaleDateString(props.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const grid = ref<HTMLElement | null>(null)
async function moveTo(d: Date) {
  focused.value = d
  await nextTick()
  grid.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
}
function pick(d: Date) {
  if (blocked(d)) return
  focused.value = d
  model.value = d
  emit('select', d)
}
function onKey(event: KeyboardEvent) {
  const d = focused.value
  const start = addDays(d, -((d.getDay() - props.weekStartsOn + 7) % 7))
  const moves: Record<string, () => Date> = {
    ArrowLeft: () => addDays(d, -1),
    ArrowRight: () => addDays(d, 1),
    ArrowUp: () => addDays(d, -7),
    ArrowDown: () => addDays(d, 7),
    Home: () => start,
    End: () => addDays(start, 6),
    PageUp: () => addMonths(d, event.shiftKey ? -12 : -1),
    PageDown: () => addMonths(d, event.shiftKey ? 12 : 1),
  }
  const move = moves[event.key]
  if (move) {
    event.preventDefault()
    void moveTo(move())
  }
  else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    pick(d)
  }
}
</script>

<template>
  <div class="inline-flex flex-col gap-2 text-ui" role="group" :aria-label="label">
    <div class="flex items-center gap-1">
      <Button variant="ghost" icon aria-label="previous month" @click="focused = addMonths(focused, -1)"><ChevronLeft :size="14" :stroke-width="1.5" /></Button>
      <p class="min-w-0 flex-1 text-center type-ui-strong" aria-live="polite">{{ caption }}</p>
      <Button variant="ghost" icon aria-label="next month" @click="focused = addMonths(focused, 1)"><ChevronRight :size="14" :stroke-width="1.5" /></Button>
    </div>
    <table ref="grid" role="grid" :aria-label="caption" class="border-collapse" @keydown="onKey">
      <thead>
        <tr>
          <th v-for="w in weekdays" :key="w.long" scope="col" :abbr="w.long" class="h-7 w-control-md p-0 text-center type-meta font-normal text-fg-muted max-md:w-control-touch">{{ w.short }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, i) in weeks" :key="i">
          <td v-for="(d, j) in week" :key="j" class="p-0" :role="d ? 'gridcell' : undefined" :aria-selected="d ? same(d, model) : undefined">
            <button
              v-if="d"
              type="button"
              class="ds-day"
              :tabindex="same(d, focused) ? 0 : -1"
              :aria-label="dayLabel(d)"
              :aria-current="same(d, today) ? 'date' : undefined"
              :aria-disabled="blocked(d) || undefined"
              :data-picked="same(d, model) || undefined"
              @click="pick(d)"
              @focus="focused = d"
            >
              {{ d.getDate() }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.ds-day { position: relative; display: inline-flex; width: var(--ds-size-control-md); height: var(--ds-size-control-md); align-items: center; justify-content: center; color: var(--ds-color-fg); font-size: var(--ds-text-ui); font-variant-numeric: tabular-nums; cursor: pointer; outline: none; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-day[aria-current="date"]::after { position: absolute; top: 4px; right: 4px; width: 4px; height: 4px; background: var(--ds-color-edge-accent); content: ""; }
@media (hover: hover) and (pointer: fine) { .ds-day:hover:not([data-picked], [aria-disabled]) { background: var(--ds-color-surface-subtle); } }
.ds-day:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
.ds-day[data-picked] { background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-weight: var(--ds-font-weight-medium); }
.ds-day[data-picked]:focus-visible { outline-color: var(--ds-color-edge-accent); }
.ds-day[aria-disabled] { color: var(--ds-color-fg-muted); text-decoration: line-through; cursor: not-allowed; }
@media (pointer: coarse), (max-width: 767px) { .ds-day { width: var(--ds-size-control-touch); height: var(--ds-size-control-touch); } }
</style>
