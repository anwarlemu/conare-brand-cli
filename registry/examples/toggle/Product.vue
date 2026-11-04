<script setup lang="ts">
import { ref } from 'vue'
import Toggle from '@/components/ui/Toggle.vue'
// Options that stay on, as the spend cap's chips do: a red square at the start and an ink edge while on.
const exact = ref(true)
const archived = ref(false)
const mine = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2" role="group" aria-label="search options">
    <Toggle v-model="exact">Exact words</Toggle>
    <Toggle v-model="archived">Include archived</Toggle>
    <Toggle v-model="mine">Only mine</Toggle>
    <Toggle disabled>Shared drives</Toggle>
  </div>
</template>
