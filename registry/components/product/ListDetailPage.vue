<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, Search } from 'lucide-vue-next'
import ConsolePage from '@/components/product/ConsolePage.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Facts from '@/components/ui/Facts.vue'
import Input from '@/components/ui/Input.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Table from '@/components/ui/Table.vue'

// A list and the page of one thing in it (pages/dashboard/namespaces, index and [namespace]): the list's head has a
// filter and the one dark button; each row opens its thing (a press, or Enter on the focused row). The thing's page
// takes its name in mono as the title, a way back and its own dark button, its facts, then what it holds in a flush
// card. A filter with no match says so. It calls nothing: v-model:open is the open row's name ('' for the list),
// `create` and `search` are the dark buttons.
export type ListDoc = { id: string, updated: string, size: string }
export type ListRow = { name: string, documents: number, created: string, searched: string, model?: string, docs?: ListDoc[] }
const props = defineProps<{ rows: ListRow[], title?: string, noun?: string }>()
const open = defineModel<string>('open', { default: '' })
const emit = defineEmits<{ create: [], search: [row: ListRow] }>()
const filter = ref('')
const shown = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return q ? props.rows.filter(r => r.name.toLowerCase().includes(q)) : props.rows
})
const row = computed(() => props.rows.find(r => r.name === open.value))
const count = (n: number) => n.toLocaleString('en-US')
function onRowKey(event: KeyboardEvent, name: string) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  open.value = name
}
</script>

<template>
  <ConsolePage v-if="row" data-ds="list-detail-page" :title="row.name" mono>
    <template #actions>
      <Button @click="open = ''"><ArrowLeft :size="12" :stroke-width="1.5" aria-hidden="true" />All {{ (noun ?? 'namespace') }}s</Button>
      <PixelButton @click="emit('search', row)"><Search :size="12" :stroke-width="1.5" aria-hidden="true" />Test a search</PixelButton>
    </template>
    <Facts :facts="[{ name: 'Documents', value: count(row.documents) }, { name: 'Created', value: row.created }, { name: 'Last searched', value: row.searched }, ...(row.model ? [{ name: 'Model', value: row.model, mono: true }] : [])]" />
    <Card title="Documents" flush>
      <Table>
        <thead><tr><th>Document</th><th class="w-px text-right max-sm:hidden">Size</th><th class="w-px">Updated</th></tr></thead>
        <tbody>
          <tr v-if="!row.docs?.length"><td colspan="3" class="py-10 text-center text-fg-muted">No documents yet.</td></tr>
          <tr v-for="d in row.docs" :key="d.id">
            <td class="max-w-0 truncate font-code" :title="d.id">{{ d.id }}</td>
            <td class="text-right whitespace-nowrap text-fg-muted tabular-nums max-sm:hidden">{{ d.size }}</td>
            <td class="whitespace-nowrap text-fg-muted">{{ d.updated }}</td>
          </tr>
        </tbody>
      </Table>
    </Card>
  </ConsolePage>

  <ConsolePage v-else data-ds="list-detail-page" :title="title ?? 'Namespaces'">
    <template #actions>
      <label class="w-64 max-sm:w-full"><Input v-model="filter" :icon="Search" :placeholder="`Filter ${(noun ?? 'namespace')}s`" :aria-label="`filter ${(noun ?? 'namespace')}s`" /></label>
      <PixelButton class="shrink-0" @click="emit('create')">New {{ noun ?? 'namespace' }}</PixelButton>
    </template>
    <p v-if="!shown.length" class="type-meta text-fg-muted">No {{ noun ?? 'namespace' }} matches "{{ filter }}".</p>
    <Table v-else framed>
      <thead><tr><th>Name</th><th class="w-32 text-right">Documents</th><th class="w-36 max-md:hidden">Last searched</th><th class="w-32 max-sm:hidden">Created</th></tr></thead>
      <tbody>
        <tr v-for="r in shown" :key="r.name" class="is-link" tabindex="0" @click="open = r.name" @keydown="onRowKey($event, r.name)">
          <td class="max-w-0 truncate font-code">{{ r.name }}</td>
          <td class="text-right tabular-nums">{{ count(r.documents) }}</td>
          <td class="whitespace-nowrap text-fg-muted max-md:hidden">{{ r.searched }}</td>
          <td class="whitespace-nowrap text-fg-muted max-sm:hidden">{{ r.created }}</td>
        </tr>
      </tbody>
    </Table>
  </ConsolePage>
</template>
