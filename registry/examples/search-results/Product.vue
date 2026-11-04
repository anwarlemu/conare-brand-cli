<script setup lang="ts">
import SearchResults from '@/components/product/SearchResults.vue'
import type { SearchResult } from '@/composables/useSearchResults'
// The results alone, as Home shows them under the box: the best match in its card with the written answer, the pages
// around its passage and its source, then the other matches, each opening in place. Press a citation to show its
// result.
const query = 'Acme renewal EU data'
const results: SearchResult[] = [
  { namespace: 'contracts', id: 'acme-msa-2026', score: 0.94, page: { number: 9, count: 24, top: 0.3, file: 'acme-msa-2026.pdf' }, text: 'Acme may renew for twelve months with 60 days written notice. On renewal, all customer data stays in the EU region named in Schedule C.' },
  { namespace: 'slack', id: 'legal-thread-1182', score: 0.81, text: 'Legal confirmed that Acme needs EU data residency in the renewal, and that Schedule C covers it.' },
  { namespace: 'sales-calls', id: 'acme-oct-review', score: 0.76, text: 'Acme asked what happens to their data at renewal. We walked through the EU region and the 60 day notice.' },
  { namespace: 'crm', id: 'acme-renewal-2026', score: 0.71, text: 'Renewal open. Blocker: data processing addendum for the EU region.' },
]
const answer = 'Acme can renew for twelve months with 60 days written notice [1], and its data stays in the EU region named in Schedule C [1][2]. The open blocker is the data processing addendum [4].'
</script>

<template>
  <SearchResults :results="results" :query="query" :answer="answer" />
</template>
