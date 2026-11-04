<script setup lang="ts">
import { ref } from 'vue'
import SuggestionChips, { type Suggestion } from '@/components/product/SuggestionChips.vue'
// Questions to start from, each ending on the namespace that answers it. Point at them: one block glides along.
const items: Suggestion[] = [
  { q: 'notice period to terminate a contract', ns: 'contracts' },
  { q: 'breach notification window', ns: 'slack' },
  { q: 'cash on hand last quarter', ns: 'sec-filings' },
]
const asked = ref('')
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <SuggestionChips :items="items" @ask="s => (asked = `Searching ${s.ns} for: ${s.q}`)" />
    <p class="min-h-4 type-meta text-fg-muted" role="status">{{ asked }}</p>
  </div>
</template>
