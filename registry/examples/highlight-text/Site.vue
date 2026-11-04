<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HighlightText from '@/components/visuals/HighlightText.vue'
// The hero's heading as the website draws it. Here it plays again every few seconds; on the website it plays once.
const round = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => round.value++, 4000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="flex flex-col items-center text-center">
    <HighlightText :key="round" as="h1" text="Search any data you bring" accent="." class="type-hero sm:type-display" />
  </div>
</template>
