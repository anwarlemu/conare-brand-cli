<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import PixelButton from '@/components/ui/PixelButton.vue'
import { useDownloadState } from '@/composables/useDocumentDownload'

// The dark button for a document, under an opened document or a result (the console's DownloadButton.vue): red
// pixels come in on hover, and it says Downloaded once it has, since the browser's own bar can sit out of sight. The
// words cross in one cell (.v2-swap): Download leaves up, Downloaded comes up with its check drawing, so the width
// holds. Its state is the document's in useDocumentDownload(), unless `done` says.
const props = defineProps<{ id: string, label?: string, done?: boolean }>()
defineEmits<{ press: [] }>()
const shared = useDownloadState()
const isDone = computed(() => props.done ?? shared.value[props.id] === 'done')
</script>

<template>
  <PixelButton :done="isDone" @click="$emit('press')">
    <span class="ds-dlswap" :data-on="isDone || undefined">
      <span class="ds-dlswap-a">{{ label ?? 'Download' }}</span>
      <span class="ds-dlswap-b" aria-hidden="true"><Check :size="12" :stroke-width="2" />Downloaded</span>
    </span>
    <span class="sr-only" aria-live="polite">{{ isDone ? 'downloaded' : '' }}</span>
  </PixelButton>
</template>

<style>
.ds-dlswap { display: grid; }
.ds-dlswap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-dlswap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-dlswap[data-on] .ds-dlswap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-dlswap[data-on] .ds-dlswap-b { opacity: 1; filter: none; transform: none; }
.ds-dlswap-b svg path { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset var(--ds-duration-micro) ease; }
.ds-dlswap[data-on] .ds-dlswap-b svg path { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-enter) var(--ds-easing-out) 40ms; }
@media (prefers-reduced-motion: reduce) {
  .ds-dlswap > span { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-dlswap-b svg path { stroke-dashoffset: 0; transition: none; }
}
</style>
