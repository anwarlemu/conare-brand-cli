<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HighlightText from '@/components/visuals/HighlightText.vue'
// The reveal in the console, as Explorer's headline has it. Here it plays again every few seconds; in the product it
// plays once.
const round = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => round.value++, 4000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <HighlightText :key="round" as="h1" text="Explore your data" accent="." class="text-center type-heading-1 md:type-hero" />
</template>
