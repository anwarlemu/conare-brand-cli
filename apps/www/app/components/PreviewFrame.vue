<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import type { SiteExample } from '~/utils/registry'

// One example in a frame: an iframe of /preview/<item>/<example>, so the example renders alone with the page's real
// widths and media queries. Desktop fills the frame; Phone shows it 390px wide. The frame takes the example's height
// (the preview posts it, open menus and dialogs included), so nothing scrolls inside it.
const props = defineProps<{ item: string, example: SiteExample }>()
const device = ref<'desktop' | 'phone'>('desktop')
const src = computed(() => `/preview/${props.item}/${props.example.name}`)
const frame = ref<HTMLIFrameElement | null>(null)
const height = ref(props.example.center ? 140 : 240)
const shown = ref(false)
watch(device, () => { shown.value = false })
function onMessage(event: MessageEvent) {
  if (event.source !== frame.value?.contentWindow || event.data?.type !== 'ds-preview-height') return
  height.value = Math.max(96, Math.ceil(event.data.height))
  shown.value = true
}
onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <figure class="min-w-0 border border-edge bg-surface">
    <figcaption class="flex min-h-10 flex-wrap items-center gap-2 border-b border-edge py-1.5 pr-2 pl-3.5 type-meta text-fg-muted">
      <span class="size-1.5 shrink-0 bg-data-3" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate">{{ example.label }}</span>
      <Tabs v-model="device" :options="[{ value: 'desktop', label: 'Desktop' }, { value: 'phone', label: 'Phone' }]" :label="`${example.label} width`" />
      <a :href="src" target="_blank" rel="noopener" class="inline-flex size-control-sm items-center justify-center text-fg-muted transition-colors duration-120 ease-standard hover:text-fg" :aria-label="`open ${example.label} on its own`"><ArrowUpRight :size="14" :stroke-width="1.5" /></a>
    </figcaption>
    <div class="flex justify-center overflow-hidden" :class="device === 'phone' && 'bg-surface-subtle'">
      <iframe
        ref="frame"
        :key="device"
        :src="src"
        :title="`${item}: ${example.label}`"
        loading="lazy"
        class="block border-0 transition-opacity duration-160 ease-out motion-reduce:transition-none"
        :class="[device === 'phone' ? 'w-97.5 max-w-full border-x border-edge' : 'w-full', shown ? 'opacity-100' : 'opacity-0']"
        :style="{ height: `${height}px` }"
      />
    </div>
  </figure>
</template>
