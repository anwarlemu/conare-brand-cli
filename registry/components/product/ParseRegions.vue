<script setup lang="ts">
import { computed } from 'vue'
import ParseSheet from '@/components/product/ParseSheet.vue'
import Table from '@/components/ui/Table.vue'
import { REGION, tableOf, useParsePoint, type ParseAnswer, type ParseBlock } from '@/composables/useParse'

// Parse, "Regions" (parse/Regions.vue): the page's structure is the result. The page in the double rule with every
// region outlined and numbered, beside a table of the regions in reading order, what each is and how sure OCR was; the
// least sure (under 80%) in red, so a reader sees at once what to check by hand. Pointing joins the two.
const props = defineProps<{ answer: ParseAnswer }>()
const { on, pinned, lit, pick } = useParsePoint()
const part = computed(() => props.answer.part)
const preview = (b: ParseBlock) => (b.type === 'table' ? `${tableOf(b.content).rows.length} rows, ${tableOf(b.content).head.length} columns` : b.content.split('\n')[0]!)
const UNSURE = 0.8
const unsure = computed(() => part.value.blocks.filter(b => b.conf != null && b.conf < UNSURE).length)
</script>

<template>
  <section class="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-6 max-lg:grid-cols-1" aria-label="regions in reading order">
    <div class="m-1.25 border border-edge bg-surface-subtle p-3 outline outline-offset-4 outline-edge">
      <ParseSheet :part="part" :scan="answer.scan" :on="lit" all plays @point="on = $event" @pick="pick" />
    </div>
    <div class="min-w-0">
      <div class="mb-2 flex items-center justify-between gap-4">
        <h2 class="type-ui-strong">{{ part.blocks.length }} regions in reading order</h2>
        <p class="type-meta text-fg-muted">{{ part.ocr ? (unsure ? `${unsure} to check by hand` : 'All read clearly') : 'Read from the text layer, no OCR needed' }}</p>
      </div>
      <div class="overflow-hidden border border-edge bg-surface">
        <Table>
          <thead><tr><th scope="col" class="w-8"><span class="sr-only">Order</span></th><th scope="col" class="w-20">Region</th><th scope="col">Text</th><th v-if="part.ocr" scope="col" class="w-20 text-right">OCR</th></tr></thead>
          <tbody>
            <tr v-for="b in part.blocks" :key="b.order" class="is-link" :class="lit === b.order && 'ds-parse-on'" @pointerenter="on = b.order" @pointerleave="on = null" @click="pick(b.order)">
              <td class="text-fg-muted tabular-nums">{{ b.order }}</td>
              <td>{{ REGION[b.type] ?? b.type }}</td>
              <td class="max-w-0"><button type="button" class="block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent" :aria-pressed="pinned === b.order" @click.stop="pick(b.order)" @focus="on = b.order" @blur="on = null">{{ preview(b) }}</button></td>
              <td v-if="part.ocr" class="text-right tabular-nums" :class="b.conf != null && b.conf < UNSURE && 'text-fg-accent'">{{ b.conf == null ? '' : `${Math.round(b.conf * 100)}%` }}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  </section>
</template>

<style>
.ds-table tbody tr.ds-parse-on td { background: color-mix(in srgb, var(--ds-color-surface-accent) 6%, transparent); }
</style>
