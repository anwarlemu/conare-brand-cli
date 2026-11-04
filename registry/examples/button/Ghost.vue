<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
// A tool in a row, as a source's Sync now: its icon turns while it syncs, and it waits until the sync lands.
const syncing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function sync() {
  syncing.value = true
  // ds-latency: stands in for the sync request in this example.
  timer = setTimeout(() => { syncing.value = false }, 1800)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Button variant="ghost" press :disabled="syncing" @click="sync">
    <RefreshCw :size="12" :stroke-width="1.5" :class="{ 'animate-spin motion-reduce:animate-none': syncing }" aria-hidden="true" />{{ syncing ? 'Syncing' : 'Sync now' }}
  </Button>
</template>
