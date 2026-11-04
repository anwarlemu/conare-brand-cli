<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Check, RefreshCw } from 'lucide-vue-next'
import PixelButton from '@/components/ui/PixelButton.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
// The dot matrix where the product uses it: beside what is working, inside a source's dark status, and in the dark button
// while it syncs. Press Sync now to watch it go to Syncing, then Synced, and back.
const sync = ref<'idle' | 'busy' | 'done'>('idle')
const timers: Array<ReturnType<typeof setTimeout>> = []
function press() {
  if (sync.value !== 'idle') return
  sync.value = 'busy'
  // ds-latency: stands in for the sync request and its confirmation in this example.
  timers.push(setTimeout(() => { sync.value = 'done' }, 2200))
  // ds-latency: the example returns to its start after showing Synced.
  timers.push(setTimeout(() => { sync.value = 'idle' }, 4200))
}
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">Beside what is working</p>
    <p class="flex items-center gap-2 type-meta text-fg-muted" aria-live="polite"><DotMatrix />Syncing HubSpot</p>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a status</p>
    <div class="flex flex-wrap items-center gap-2">
      <StatusTag status="syncing" />
      <StatusTag status="connecting" />
    </div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a button</p>
    <div class="flex items-center">
      <PixelButton :done="sync === 'done'" :aria-busy="sync === 'busy'" @click="press">
        <DotMatrix v-if="sync === 'busy'" tone="inverse" />
        <Check v-else-if="sync === 'done'" :size="12" :stroke-width="2" aria-hidden="true" />
        <RefreshCw v-else :size="12" :stroke-width="1.5" aria-hidden="true" />
        {{ sync === 'busy' ? 'Syncing' : sync === 'done' ? 'Synced' : 'Sync now' }}
      </PixelButton>
    </div>
  </div>
</template>
