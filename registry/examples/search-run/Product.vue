<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import SearchRun from '@/components/product/SearchRun.vue'
import type { SearchResult } from '@/composables/useSearchResults'
// The run alone, on a loop: "Searching" over the namespaces while the index flickers, then where the answer was found,
// each document a red square to point at. In the product it follows the request's real clock. It keeps the taller
// state's height, so nothing under it moves, and holds still while the pointer or focus is in it. Once the answer is in,
// Show code opens the request under the footer.
const results: SearchResult[] = [
  { namespace: 'contracts', id: 'acme-msa-2026', score: 0.94, text: 'Acme may renew for twelve months with 60 days written notice.' },
  { namespace: 'slack', id: 'legal-thread-1182', score: 0.81, text: 'Legal confirmed that Acme needs EU data residency in the renewal.' },
  { namespace: 'sales-calls', id: 'acme-oct-review', score: 0.76, text: 'Acme asked what happens to their data at renewal.' },
  { namespace: 'crm', id: 'acme-renewal-2026', score: 0.71, text: 'Renewal open. Blocker: data processing addendum for the EU region.' },
]
const namespaces = [
  { name: 'sec-filings', documents: 2184920 },
  { name: 'contracts', documents: 412830 },
  { name: 'slack', documents: 96410 },
  { name: 'crm', documents: 52660 },
  { name: 'sales-calls', documents: 2870 },
]
const code = `curl https://api.conare.ai/v1/query \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Acme renewal EU data", "top_k": 10}'`

const searching = ref(true)
const answer = computed(() => (searching.value ? null : { results, took_ms: 312 }))
let timer: ReturnType<typeof setTimeout> | undefined
const pointed = ref(false)
const focused = ref(false)
function wait() {
  clearTimeout(timer)
  if (!pointed.value && !focused.value) timer = setTimeout(next, searching.value ? 600 : 5000)
}
function next() {
  searching.value = !searching.value
  wait()
}
watch([pointed, focused], wait)
const root = ref<HTMLElement | null>(null)
function leave(e: FocusEvent) {
  focused.value = !!root.value?.contains(e.relatedTarget as Node | null)
}
const tallest = ref(0)
let sizer: ResizeObserver | undefined
onMounted(() => {
  wait()
  const box = root.value?.firstElementChild
  if (!box) return
  sizer = new ResizeObserver(() => { tallest.value = Math.max(tallest.value, box.getBoundingClientRect().height) })
  sizer.observe(box)
})
onBeforeUnmount(() => { clearTimeout(timer); sizer?.disconnect() })
</script>

<template>
  <div ref="root" :style="tallest ? { minHeight: `${tallest}px` } : undefined" @pointerenter="pointed = true" @pointerleave="pointed = false" @focusin="focused = true" @focusout="leave">
    <SearchRun :searching="searching" :answer="answer" :namespaces="namespaces" :code="code" />
  </div>
</template>
