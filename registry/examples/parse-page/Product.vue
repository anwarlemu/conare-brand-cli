<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import ConsolePage from '@/components/product/ConsolePage.vue'
import ParsePage from '@/components/product/ParsePage.vue'
import type { ParseAnswer } from '@/composables/useParse'
import { consoleGroups } from '@/examples/accuracy-views/sample'
import { PARSE_SAMPLES, parseSample } from '@/examples/parse-views/sample'
// Parse as it ships, in the console's frame: pick a file to try and the reading follows; your own file shows the
// sample's reading, and the page says so. Sample data for Acme; wire `file` to POST /parse in your app.
const chosen = ref('statement')
const answer = shallowRef<ParseAnswer | null>(parseSample('statement'))
const reading = ref(false)
const own = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
function read(sample: string, name?: string) {
  reading.value = true
  clearTimeout(timer)
  // ds-latency: a sample read's length, standing in for the API's.
  timer = setTimeout(() => {
    answer.value = parseSample(sample, name)
    reading.value = false
  }, 600)
}
watch(chosen, s => read(s))
function file(f: File) {
  own.value = f.name
  read('statement', f.name)
}
onBeforeUnmount(() => clearTimeout(timer))
const curl = `curl -X POST "https://api.conare.ai/v1/parse?layout=true" \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -H "Content-Type: application/octet-stream" \\
  --data-binary @"Acme 2025 annual report.pdf"`
</script>

<template>
  <ConsoleFrame :groups="consoleGroups('')" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Parse' }]">
    <ConsolePage title="Parse">
      <ParsePage v-model:chosen="chosen" :samples="PARSE_SAMPLES" :answer="answer" :reading="reading" :namespaces="['sec-filings', 'contracts', 'support']" :curl="curl" :own="own" @file="file" />
    </ConsolePage>
  </ConsoleFrame>
</template>
