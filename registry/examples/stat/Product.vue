<script setup lang="ts">
import { ref } from 'vue'
import Stat from '@/components/ui/Stat.vue'
import Stats from '@/components/ui/Stats.vue'
// The queries card's stats; press one to pin it.
const pinned = ref('month')
const stats = [
  { id: 'month', label: 'This month', value: '186,402' },
  { id: 'today', label: 'Today', value: '7,912' },
  { id: 'latency', label: 'Search p50, 24 h', value: '238 ms' },
]
</script>

<template>
  <div class="max-w-160 border border-edge bg-surface">
    <Stats>
      <Stat v-for="s in stats" :key="s.id" :label="s.label" :value="s.value" :pressed="pinned === s.id" @press="pinned = s.id" />
    </Stats>
  </div>
</template>
