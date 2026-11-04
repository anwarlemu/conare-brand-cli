<script setup lang="ts">
import { Copy, Download, RefreshCw, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
// A row's tools as icon buttons, each named by its tooltip. Point at one and wait, then move along: the next shows at
// once. Tab to one and its name shows without a wait.
const tools = [
  { label: 'Copy ID', icon: Copy },
  { label: 'Download', icon: Download },
  { label: 'Sync again', icon: RefreshCw },
  { label: 'Delete', icon: Trash2 },
]
</script>

<template>
  <div class="flex min-h-24 items-start justify-center gap-1">
    <Tooltip v-for="t in tools" :key="t.label" :text="t.label">
      <Button variant="ghost" icon :aria-label="t.label.toLowerCase()"><component :is="t.icon" :size="14" :stroke-width="1.5" /></Button>
    </Tooltip>
  </div>
</template>
