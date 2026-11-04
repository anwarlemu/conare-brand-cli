<script setup lang="ts">
import { Copy, MoreHorizontal, Plus, RotateCw, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
// The console's buttons: one dark main action, secondary for the rest, ghost for tools in a row, danger for what
// removes, the red fix for a failure, and an icon button with its name.
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button variant="dark"><Plus :size="14" :stroke-width="1.5" aria-hidden="true" />Create key</Button>
      <Button><Copy :size="14" :stroke-width="1.5" aria-hidden="true" />Copy as code</Button>
      <Button>Cancel</Button>
      <Button variant="ghost"><RotateCw :size="14" :stroke-width="1.5" aria-hidden="true" />Sync now</Button>
      <Button variant="ghost" icon aria-label="row actions"><MoreHorizontal :size="14" :stroke-width="1.5" /></Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button variant="danger"><Trash2 :size="14" :stroke-width="1.5" aria-hidden="true" />Revoke</Button>
      <Button variant="brand">Reconnect HubSpot</Button>
    </div>
  </div>
</template>
