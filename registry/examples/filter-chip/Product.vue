<script setup lang="ts">
import { ref } from 'vue'
import FilterChip from '@/components/product/FilterChip.vue'
// The search's filters, as they sit under the box: pick one and the chip names it.
const app = ref('')
const type = ref('')
const apps = ['Slack', 'Notion', 'Gmail', 'HubSpot']
const types = ['Message', 'Page', 'Email', 'File']
</script>

<template>
  <div class="flex h-65 flex-wrap items-start gap-2">
    <FilterChip v-model="app" label="App" any="Any app" :options="apps.map(a => ({ value: a, label: a }))" />
    <FilterChip v-model="type" label="Type" any="Any type" :options="types.map(t => ({ value: t, label: t }))" />
  </div>
</template>
