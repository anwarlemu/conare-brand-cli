<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import SearchResults from '@/components/product/SearchResults.vue'
import WrittenAnswer from '@/components/product/WrittenAnswer.vue'
import type { SearchResult } from '@/composables/useSearchResults'
// On request: one button, since a written answer costs a second query. Here the answer is written on sample data.
const query = 'Acme renewal EU data'
const results: SearchResult[] = [
  { namespace: 'contracts', id: 'acme-msa-2026', score: 0.94, page: { number: 9, count: 24, top: 0.3, file: 'acme-msa-2026.pdf' }, text: 'Acme may renew for twelve months with 60 days written notice. On renewal, all customer data stays in the EU region named in Schedule C.' },
  { namespace: 'slack', id: 'legal-thread-1182', score: 0.81, text: 'Legal confirmed that Acme needs EU data residency in the renewal, and that Schedule C covers it.' },
  { namespace: 'crm', id: 'acme-renewal-2026', score: 0.71, text: 'Renewal open. Blocker: data processing addendum for the EU region.' },
]
const text = ref('')
const writing = ref(false)
const reveal = ref<{ key: string, at: number } | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
function write() {
  writing.value = true
  timer = setTimeout(() => {
    text.value = 'Acme can renew for twelve months with 60 days written notice, and its data stays in the EU region in Schedule C [1][2]. The open blocker is the data processing addendum [3].'
    writing.value = false
  }, 1800)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="flex flex-col gap-3">
    <WrittenAnswer mode="request" :results="results" :text="text" :writing="writing" @write="write" @cite="reveal = { key: $event, at: Date.now() }" />
    <SearchResults :results="results" :query="query" :reveal="reveal" />
  </div>
</template>
