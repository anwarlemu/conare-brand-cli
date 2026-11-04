<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import StatusTag from '@/components/ui/StatusTag.vue'
import Table from '@/components/ui/Table.vue'
// The namespaces table on sample data: press a row and it opens in place to where its documents come from; press it
// again, or another row, and it closes as the next one opens. Names in mono, numbers in tabular figures.
const rows = [
  { name: 'contracts', documents: 412830, source: 'Google Drive', status: 'ready', queried: '2 min ago' },
  { name: 'slack', documents: 96410, source: 'Slack', status: 'syncing', queried: '1 h ago' },
  { name: 'crm', documents: 52660, source: 'HubSpot', status: 'error', queried: 'yesterday' },
  { name: 'support', documents: 18204, source: 'API', status: 'ready', queried: '3 days ago' },
]
const opened = ref<string | null>(null)
const toggle = (name: string) => { opened.value = opened.value === name ? null : name }
</script>

<template>
  <Table framed label="namespaces">
    <thead>
      <tr><th>Namespace</th><th class="text-right">Documents</th><th>Health</th><th>Last query</th><th class="w-px"><span class="sr-only">Open</span></th></tr>
    </thead>
    <tbody>
      <template v-for="r in rows" :key="r.name">
        <tr class="is-link" tabindex="0" :aria-expanded="opened === r.name" @click="toggle(r.name)" @keydown.enter.prevent="toggle(r.name)" @keydown.space.prevent="toggle(r.name)">
          <td class="type-code-sm">{{ r.name }}</td>
          <td class="text-right tabular-nums">{{ r.documents.toLocaleString('en-US') }}</td>
          <td><StatusTag :status="r.status" /></td>
          <td class="type-meta whitespace-nowrap text-fg-muted">{{ r.queried }}</td>
          <td><ChevronDown :size="14" :stroke-width="1.5" class="text-fg-muted transition-[rotate] duration-160 ease-out motion-reduce:transition-none" :class="opened === r.name && 'rotate-180'" aria-hidden="true" /></td>
        </tr>
        <tr v-if="opened === r.name">
          <td colspan="5" class="bg-surface-subtle">
            <p class="type-meta text-fg-soft">{{ r.documents.toLocaleString('en-US') }} documents from {{ r.source }}. Searched {{ r.queried }}.</p>
          </td>
        </tr>
      </template>
    </tbody>
  </Table>
</template>
