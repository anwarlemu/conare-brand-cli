<script setup lang="ts">
import ParseReading from '@/components/product/ParseReading.vue'
import { parseSample } from '@/examples/parse-views/sample'
// Document reading, Plain or Conare: a plain PDF reader's text and Conare's, the same page, one handle between them.
// Point at a region on the page or in the text; a click pins it. A sample reading of Acme's income statement.
const answer = parseSample('statement')
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <ParseReading :answer="answer" :version="3" />
  </div>
</template>
