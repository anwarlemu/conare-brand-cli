<script setup lang="ts">
import SourceRow from '@/components/product/SourceRow.vue'
// A sample team's sources as getting started lists them: an app on its schedule, one syncing, one that failed, and one
// pushed through the API.
const sources = [
  { name: 'Acme drive', app: 'Google Drive', status: 'ready', every: 'every 6 hours', synced: '2 hours ago', next: 'in 4 hours' },
  { name: 'Acme Slack', app: 'Slack', status: 'syncing', synced: '6 hours ago' },
  { name: 'Wiki', app: 'Notion', status: 'error', synced: 'yesterday' },
  { name: 'Support inbox', app: 'Gmail', status: 'pushed', synced: '12 minutes ago' },
] as const
</script>

<template>
  <ul class="flex max-w-140 flex-col gap-3">
    <li v-for="s in sources" :key="s.name"><SourceRow v-bind="s" detail @open="(e: MouseEvent) => e.preventDefault()" /></li>
  </ul>
</template>
