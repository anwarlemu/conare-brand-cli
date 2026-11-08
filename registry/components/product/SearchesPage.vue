<script setup lang="ts">
import { computed } from 'vue'
import ConsolePage from '@/components/product/ConsolePage.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SearchesLog, { type SearchOutcome, type SearchPassage, type SearchRow } from '@/components/product/SearchesLog.vue'

// Searches as it ships (pages/dashboard/searches.vue, take 1, Log): what an agent asked and what it read. The page's
// one filter sits in its head (All, Weak match, Nothing found, Failed); the log under it, rows opening in place. With
// no searches yet, the dashed box says where they come from and Connect an agent leads there.
type Show = 'all' | Exclude<SearchOutcome, 'strong'>
const props = defineProps<{ rows: SearchRow[] }>()
const show = defineModel<Show>('show', { default: 'all' })
const emit = defineEmits<{ connect: [], download: [passage: SearchPassage], fix: [row: SearchRow], search: [question: string] }>()
const FILTERS: Array<{ value: Show, label: string }> = [{ value: 'all', label: 'All' }, { value: 'weak', label: 'Weak match' }, { value: 'none', label: 'Nothing found' }, { value: 'failed', label: 'Failed' }]
const shown = computed(() => props.rows.filter(r => show.value === 'all' || r.outcome === show.value))
</script>

<template>
  <ConsolePage data-ds="searches-page" title="Searches">
    <template v-if="rows.length" #actions>
      <Tabs v-model="show" :options="FILTERS" label="which searches" />
    </template>
    <EmptyState v-if="!rows.length" title="No searches yet" description="Every search your agents run shows here, with what it read.">
      <PixelButton @click="emit('connect')">Connect an agent</PixelButton>
    </EmptyState>
    <p v-else-if="!shown.length" class="type-meta text-fg-muted">No searches like this in the last few hours.</p>
    <div v-else class="flex flex-col gap-3">
      <SearchesLog :rows="shown" @download="emit('download', $event)" @fix="emit('fix', $event)" @search="emit('search', $event)" />
    </div>
  </ConsolePage>
</template>
