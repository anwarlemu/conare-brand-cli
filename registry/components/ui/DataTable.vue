<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-vue-next'
import FilterChip from '@/components/product/FilterChip.vue'
import ShowMore from '@/components/ui/ShowMore.vue'
import Table from '@/components/ui/Table.vue'

// A table people narrow and order (Table with the search's filter chips and the credit history's foot): a filter-chip
// per filter over it, heads that sort (aria-sort; the arrow shows the order, a faint pair where it could), and the first
// `pageSize` rows with "Show N more" under them, each new row landing as the credit history's lines do. Filters and
// sort reset what is shown. Cells render the value (numbers right, in tabular figures, en-US), or the slot
// `cell-<key>` with { row, value }. Nothing matching shows one line with a way to clear the filters.
export type DataColumn = { key: string, label: string, align?: 'left' | 'right', sortable?: boolean, mono?: boolean, muted?: boolean }
export type DataFilter = { key: string, label: string, options: string[], any?: string }

const props = withDefaults(defineProps<{ columns: DataColumn[], rows: Row[], rowKey: string, label: string, filters?: DataFilter[], pageSize?: number }>(), { filters: () => [], pageSize: 5 })

const picked = ref<Record<string, string>>({})
const sort = ref<{ key: string, dir: 'ascending' | 'descending' } | null>(null)
const shown = ref(props.pageSize)
const fresh = ref<number | null>(null)

const filtered = computed(() => props.rows.filter(r => props.filters.every(f => !picked.value[f.key] || String(r[f.key]) === picked.value[f.key])))
const sorted = computed(() => {
  const s = sort.value
  if (!s) return filtered.value
  const sign = s.dir === 'ascending' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    const x = a[s.key]
    const y = b[s.key]
    return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)))
  })
})
const visible = computed(() => sorted.value.slice(0, shown.value))
const more = computed(() => Math.min(props.pageSize, sorted.value.length - shown.value))
const anyOn = computed(() => Object.values(picked.value).some(Boolean))

watch([picked, sort], () => { shown.value = props.pageSize; fresh.value = null }, { deep: true })

function toggleSort(key: string) {
  const s = sort.value
  sort.value = s?.key !== key ? { key, dir: 'ascending' } : s.dir === 'ascending' ? { key, dir: 'descending' } : null
}
function showMore() {
  fresh.value = shown.value
  shown.value += props.pageSize
}
const display = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : String(v ?? ''))
</script>

<template>
  <div class="ds-data-table flex min-w-0 flex-col gap-3">
    <div v-if="filters.length" class="flex flex-wrap items-center gap-2">
      <FilterChip v-for="f in filters" :key="f.key" :model-value="picked[f.key] ?? ''" @update:model-value="(v: string) => { picked[f.key] = v }" :label="f.label" :options="f.options.map(o => ({ value: o, label: o }))" :any="f.any ?? 'Any'" />
      <button v-if="anyOn" type="button" class="ds-more relative ml-1 cursor-pointer text-meta font-medium text-fg-soft" @click="picked = {}">Clear filters</button>
    </div>
    <Table framed :label="label">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key" :class="c.align === 'right' && 'text-right'" :aria-sort="sort?.key === c.key ? sort.dir : c.sortable ? 'none' : undefined">
            <button v-if="c.sortable" type="button" class="ds-sort inline-flex cursor-pointer items-center gap-1" :class="c.align === 'right' && 'flex-row-reverse'" @click="toggleSort(c.key)">
              {{ c.label }}
              <ArrowUp v-if="sort?.key === c.key && sort.dir === 'ascending'" :size="12" :stroke-width="1.5" class="text-fg" aria-hidden="true" />
              <ArrowDown v-else-if="sort?.key === c.key" :size="12" :stroke-width="1.5" class="text-fg" aria-hidden="true" />
              <ArrowUpDown v-else :size="12" :stroke-width="1.5" class="ds-sort-idle" aria-hidden="true" />
            </button>
            <template v-else>{{ c.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in visible" :key="String(r[rowKey])" :data-new="fresh !== null && i >= fresh ? '' : undefined" :style="fresh !== null && i >= fresh ? { '--i': i - fresh } : undefined">
          <td v-for="c in columns" :key="c.key" :class="[c.align === 'right' && 'text-right tabular-nums', c.mono && 'type-code-sm', c.muted && 'type-meta whitespace-nowrap text-fg-muted']">
            <slot :name="`cell-${c.key}`" :row="r" :value="r[c.key]">{{ display(r[c.key]) }}</slot>
          </td>
        </tr>
        <tr v-if="!visible.length">
          <td :colspan="columns.length" class="py-6 text-center type-meta text-fg-muted">
            <slot name="empty">Nothing matches these filters. <button type="button" class="ds-more relative ml-1 cursor-pointer font-medium text-fg-soft" @click="picked = {}">Clear filters</button></slot>
          </td>
        </tr>
      </tbody>
    </Table>
    <div v-if="sorted.length > pageSize" class="flex items-center justify-between gap-3">
      <ShowMore v-if="more > 0" :count="more" @click="showMore" />
      <span class="ml-auto type-meta text-fg-muted tabular-nums">{{ visible.length }} of {{ sorted.length }}</span>
    </div>
  </div>
</template>

<style>
.ds-sort { margin: 0 -4px; padding: 0 var(--ds-space-xs); color: inherit; font: inherit; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-sort-idle { color: var(--ds-color-fg-faint); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-sort:hover { color: var(--ds-color-fg); }
  .ds-sort:hover .ds-sort-idle { color: var(--ds-color-fg-muted); }
}
.ds-sort:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 0; }
/* Five more: each new row lands on the one above, one after the other (.v2-ledger li[data-new]). */
.ds-data-table tr[data-new] { animation: ds-row-in var(--ds-duration-rise) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 30ms); }
@keyframes ds-row-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .ds-data-table tr[data-new] { animation-name: ds-row-fade; } }
@keyframes ds-row-fade { from { opacity: 0; } }
</style>
