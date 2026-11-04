<script setup lang="ts">
import DataTable from '@/components/ui/DataTable.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
// Searches on sample data: filter by app and status, sort by documents or time, five at a time.
const apps = ['Google Drive', 'Slack', 'Notion', 'API']
const statuses = ['ready', 'syncing', 'error']
const rows = Array.from({ length: 17 }, (_, i) => ({
  id: `ns-${i + 1}`,
  name: ['contracts', 'support', 'sales-calls', 'wiki', 'crm', 'handbook'][i % 6] + (i > 5 ? `-${Math.floor(i / 6) + 1}` : ''),
  app: apps[i % 4]!,
  documents: ((i * 7919) % 90000) + 1200,
  status: statuses[i % 7 === 3 ? 2 : i % 5 === 1 ? 1 : 0]!,
  queried: `${(i % 9) + 1} h ago`,
  hours: (i % 9) + 1,
}))
const columns = [
  { key: 'name', label: 'Namespace', sortable: true, mono: true },
  { key: 'app', label: 'Source' },
  { key: 'documents', label: 'Documents', align: 'right' as const, sortable: true },
  { key: 'status', label: 'Health' },
  { key: 'hours', label: 'Last query', sortable: true, muted: true },
]
const filters = [{ key: 'app', label: 'App', options: apps }, { key: 'status', label: 'Health', options: statuses }]
</script>

<template>
  <DataTable :columns="columns" :rows="rows" row-key="id" label="namespaces" :filters="filters">
    <template #cell-status="{ value }"><StatusTag :status="String(value)" /></template>
    <template #cell-hours="{ row }">{{ row.queried }}</template>
  </DataTable>
</template>
