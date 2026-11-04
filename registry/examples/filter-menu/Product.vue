<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FilterMenu, { type FilterGroup } from '@/components/product/FilterMenu.vue'
// The menu, opened as the frame loads; pick a filter and the button counts it. Sample apps and types.
const groups: FilterGroup[] = [
  { key: 'app', label: 'App', options: ['Slack', 'Notion', 'Gmail', 'HubSpot'].map(a => ({ value: a, label: a })) },
  { key: 'type', label: 'Type', options: ['PDF', 'Word', 'Email', 'Message', 'Page', 'Code', 'Issue', 'Record', 'Transcript'].map(t => ({ value: t, label: t })) },
  { key: 'days', label: 'Date', options: [{ value: 7, label: 'Past week' }, { value: 30, label: 'Past month' }, { value: 365, label: 'Past year' }] },
]
const filters = ref<Record<string, string | number>>({ app: '', type: '', days: 0 })
const root = ref<HTMLElement | null>(null)
onMounted(() => setTimeout(() => root.value?.querySelector<HTMLButtonElement>('button')?.click(), 300))
</script>

<template>
  <div ref="root" class="flex h-110 items-start gap-3">
    <FilterMenu v-model="filters" :groups="groups" />
  </div>
</template>
