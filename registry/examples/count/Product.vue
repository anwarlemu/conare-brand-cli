<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Count from '@/components/ui/Count.vue'
// The count climbs by itself, as a syncing source's documents do between polls.
const documents = ref(412830)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { documents.value += 1240 }, 2000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <p class="text-heading-4 font-medium"><Count :value="documents" /> <span class="type-meta font-normal text-fg-muted">documents</span></p>
</template>
