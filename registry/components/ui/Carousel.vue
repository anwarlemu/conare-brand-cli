<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

// Slides in a row, one or more in view (new in Conare's style): square, a hairline round the track, the arrows as ghost
// icon buttons with the place in tabular figures between them. Native scroll snap, so a swipe or a trackpad moves it as
// the arrows do; arrow keys work on the focused track. Never plays on its own. Each slide is a slot item: pass `count`
// and write the slides in `#slide="{ index }"`. `perView` sets how many show at 768px and up (one on phones).
const props = withDefaults(defineProps<{ count: number, label: string, perView?: 1 | 2 | 3 }>(), { perView: 1 })
const track = ref<HTMLElement | null>(null)
const current = ref(0)
const last = computed(() => Math.max(0, props.count - visible.value))
const visible = ref(1)

function measure() {
  const el = track.value
  const first = el?.firstElementChild as HTMLElement | null
  if (!el || !first) return
  visible.value = Math.max(1, Math.round(el.clientWidth / first.offsetWidth))
  current.value = Math.min(last.value, Math.round(el.scrollLeft / first.offsetWidth))
}
function go(i: number) {
  const el = track.value
  const first = el?.firstElementChild as HTMLElement | null
  if (!el || !first) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({ left: Math.max(0, Math.min(last.value, i)) * first.offsetWidth, behavior: reduce ? 'auto' : 'smooth' })
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') { e.preventDefault(); go(current.value + 1) }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(current.value - 1) }
}
let ro: ResizeObserver | undefined
onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  if (track.value) ro.observe(track.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <section data-ds="carousel" class="flex flex-col gap-2" role="region" aria-roledescription="carousel" :aria-label="label">
    <div
      ref="track"
      class="ds-carousel fade-x flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain border border-edge"
      :data-per-view="perView"
      tabindex="0"
      :aria-label="`${label}, use the arrow keys to move`"
      @scroll.passive="measure"
      @keydown="onKey"
    >
      <div
        v-for="i in count"
        :key="i"
        class="ds-carousel-slide shrink-0 snap-start border-e border-edge last:border-e-0"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${i} of ${count}`"
      >
        <slot name="slide" :index="i - 1" />
      </div>
    </div>
    <div class="flex items-center justify-end gap-1">
      <Button variant="ghost" icon :disabled="current <= 0" :aria-label="`previous ${label}`" @click="go(current - 1)"><ChevronLeft :size="14" :stroke-width="1.5" aria-hidden="true" /></Button>
      <span class="min-w-12 text-center type-meta text-fg-muted tabular-nums" aria-live="polite">{{ current + 1 }} / {{ last + 1 }}</span>
      <Button variant="ghost" icon :disabled="current >= last" :aria-label="`next ${label}`" @click="go(current + 1)"><ChevronRight :size="14" :stroke-width="1.5" aria-hidden="true" /></Button>
    </div>
  </section>
</template>

<style>
.ds-carousel { scrollbar-width: none; }
.ds-carousel::-webkit-scrollbar { display: none; }
.ds-carousel:focus-visible { outline-offset: var(--ds-border-focus); }
.ds-carousel-slide { width: 100%; }
@media (min-width: 768px) {
  .ds-carousel[data-per-view="2"] .ds-carousel-slide { width: 50%; }
  .ds-carousel[data-per-view="3"] .ds-carousel-slide { width: calc(100% / 3); }
}
</style>
