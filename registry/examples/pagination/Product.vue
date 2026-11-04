<script setup lang="ts">
import { computed, ref } from 'vue'
import Pagination from '@/components/ui/Pagination.vue'
import ShowMore from '@/components/ui/ShowMore.vue'
import Table from '@/components/ui/Table.vue'
// The audit log by page, where a page is a place to come back to; and credits added, read from the top, five more at
// a time.
const events = Array.from({ length: 23 }, (_, i) => ({ id: i, what: ['Key created', 'Member invited', 'Namespace deleted', 'Key revoked'][i % 4]!, who: `member${(i % 3) + 1}@acme.dev`, when: `Oct ${28 - i}` }))
const page = ref(1)
const PER = 5
const pages = Math.ceil(events.length / PER)
const onPage = computed(() => events.slice((page.value - 1) * PER, page.value * PER))
const grants = Array.from({ length: 12 }, (_, i) => ({ id: i, amount: (12 - i) * 50, when: `${['Oct', 'Sep', 'Aug', 'Jul'][i % 4]} ${1 + i}` }))
const shown = ref(5)
</script>

<template>
  <div class="grid gap-8 md:grid-cols-2">
    <div class="flex flex-col gap-3">
      <Table framed label="audit log">
        <thead><tr><th>Event</th><th>By</th><th class="text-right">When</th></tr></thead>
        <tbody><tr v-for="e in onPage" :key="e.id"><td>{{ e.what }}</td><td class="type-code-sm">{{ e.who }}</td><td class="text-right type-meta text-fg-muted">{{ e.when }}</td></tr></tbody>
      </Table>
      <Pagination v-model:page="page" :pages="pages" label="audit log pages" class="self-end" />
    </div>
    <div class="flex flex-col gap-3">
      <ul class="flex flex-col border border-edge">
        <li v-for="g in grants.slice(0, shown)" :key="g.id" class="flex justify-between border-b border-edge px-3 py-2.5 last:border-b-0 type-ui"><span class="text-fg-muted">{{ g.when }}</span><span class="tabular-nums">+${{ g.amount.toFixed(2) }}</span></li>
      </ul>
      <ShowMore v-if="shown < grants.length" class="self-start" :count="Math.min(5, grants.length - shown)" @click="shown += 5" />
    </div>
  </div>
</template>
