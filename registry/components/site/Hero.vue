<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import SiteTag from '@/components/ui/SiteTag.vue'
import HighlightText from '@/components/visuals/HighlightText.vue'
import Burst from '@/components/visuals/Burst.vue'
import Grain from '@/components/visuals/Grain.vue'
import RoomGrid from '@/components/visuals/RoomGrid.vue'

// The home's first band (Hero.vue, UseCases.vue): the eyebrow tag, the headline in Faculty Glyphic with its red stop
// and its letter reveal (highlight-text: faint red letters settling to ink, once, as it comes on screen), one line, the
// one action (a button-link), then the red frame: a room in one-point perspective with the burst's slabs, under the
// grain, in a triple grey rule, with the window (the `window` slot) in front at up to 600px. The parts above settle up
// 12px in turn (320ms, 60ms apart). With `tabs`, the teams stand on the frame's top as stepped-corner tabs; the picked
// one is red, and a line along its foot fills over `turn` ms as the timer, handing over to the next team. The timer
// runs only while the frame is on screen, pauses while a pointer rests on it, and never runs for reduced motion.
// v-model is the picked tab's index. Tab `mark` is an optional pixel pattern: a path on a 16px square.
const props = withDefaults(defineProps<{
  eyebrow?: string
  title: string
  accent?: string
  body?: string
  tabs?: { label: string, mark?: string }[]
  tabsLabel?: string
  turn?: number
}>(), { accent: '.', tabs: () => [], tabsLabel: 'Team', turn: 6000 })
const active = defineModel<number>({ default: 0 })
const uid = useId()

const stage = ref<HTMLElement | null>(null)
const inView = ref(false)
const still = ref(false)
// Each pick restarts the timer.
const run = ref(0)
let io: IntersectionObserver | undefined

function pick(i: number) {
  if (i === active.value) return
  active.value = i
  run.value++
}
function next() {
  active.value = (active.value + 1) % props.tabs.length
  run.value++
}
function onKey(e: KeyboardEvent) {
  const n = props.tabs.length
  const to = e.key === 'ArrowRight' ? (active.value + 1) % n : e.key === 'ArrowLeft' ? (active.value - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
  if (to === null) return
  e.preventDefault()
  pick(to)
  ;(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus()
}

onMounted(() => {
  still.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!stage.value || !('IntersectionObserver' in window)) {
    inView.value = true
    return
  }
  io = new IntersectionObserver(([e]) => { inView.value = !!e?.isIntersecting })
  io.observe(stage.value)
})
onBeforeUnmount(() => io?.disconnect())

const timed = computed(() => props.tabs.length > 1 && props.turn > 0)
</script>

<template>
  <section data-ds="hero" :aria-labelledby="`${uid}-title`" class="ds-hero mx-auto max-w-[1440px] px-4 pt-24 pb-24 sm:px-6 lg:px-10 lg:pt-32">
    <div class="flex flex-col items-center text-center">
      <p v-if="eyebrow" class="ds-settle mb-4 flex justify-center"><SiteTag>{{ eyebrow }}</SiteTag></p>
      <h1 v-if="$slots.title" :id="`${uid}-title`" class="ds-hero-title font-heading text-hero font-normal tracking-display sm:text-display"><slot name="title" /></h1>
      <HighlightText v-else :id="`${uid}-title`" as="h1" :text="title" :accent="accent" class="ds-hero-title font-heading text-hero font-normal tracking-display sm:text-display" />
      <p v-if="body" class="ds-settle mt-4 max-w-[600px] text-input text-balance text-fg-muted" style="--i: 1">{{ body }}</p>
      <div v-if="$slots.action" class="ds-settle mt-8" style="--i: 2"><slot name="action" /></div>
    </div>

    <div ref="stage" class="ds-hero-stage mt-10 w-full lg:mt-14" :data-running="inView && !still" :style="{ '--turn': `${turn}ms` }">
      <div v-if="tabs.length" role="tablist" :aria-label="tabsLabel" class="relative z-10 -mb-px flex items-end gap-px sm:justify-center sm:gap-1" @keydown="onKey">
        <button
          v-for="(t, i) in tabs"
          :id="`${uid}-tab-${i}`"
          :key="t.label"
          role="tab"
          type="button"
          :aria-selected="i === active"
          :aria-controls="`${uid}-window`"
          :tabindex="i === active ? 0 : -1"
          class="ds-hero-tab relative flex h-8 min-w-0 flex-1 basis-0 items-center justify-center gap-2 overflow-hidden px-0.5 text-caption leading-4 whitespace-nowrap sm:h-9 sm:px-2 sm:text-ui md:w-36 md:flex-none md:px-4"
          :data-on="i === active"
          @pointerdown.left="pick(i)"
          @click="pick(i)"
        >
          <span aria-hidden="true" class="ds-hero-tab-edge absolute inset-0" />
          <span aria-hidden="true" class="ds-hero-tab-ground absolute inset-px" />
          <svg v-if="t.mark" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" class="ds-hero-tab-mark relative size-3.5 shrink-0 max-sm:hidden"><path :d="t.mark" class="fill-current" /></svg>
          <span class="relative">{{ t.label }}</span>
          <span v-if="i === active && timed" aria-hidden="true" class="absolute inset-x-px bottom-px h-0.5 overflow-hidden">
            <span :key="run" class="ds-hero-fill block h-full bg-off-white" @animationend="next()" />
          </span>
        </button>
      </div>

      <!-- The shell: the frame's outer rule, 9px out; the frame's second rule 5px out of its border. -->
      <div class="relative -mx-2.5 border border-edge-strong p-2.25">
        <div class="ds-hero-frame relative">
          <div class="relative flex w-full justify-center overflow-hidden border border-edge-strong bg-home-red px-4 py-10 text-ds-neutral-300 sm:px-8 sm:py-16 lg:py-20">
            <Grain />
            <RoomGrid />
            <Burst :inner="0.01" corners />
            <div class="relative w-full max-w-[600px]">
              <div :id="`${uid}-window`" data-burst-clear class="relative z-10 w-full" :role="tabs.length ? 'tabpanel' : undefined" :aria-labelledby="tabs.length ? `${uid}-tab-${active}` : undefined">
                <slot name="window" :active="active" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.ds-hero-title { line-height: 1.1; text-wrap: balance; }
/* Elements enter flat and settle upward (home.css .settle). */
.ds-settle { animation: ds-settle var(--ds-duration-entrance) var(--ds-easing-standard) both; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes ds-settle { from { opacity: 0; transform: translateY(12px); } }
.ds-hero-frame::before { position: absolute; inset: -5px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); content: ""; pointer-events: none; }
/* A short window (a small laptop, a phone on its side): less room above, a smaller heading, a closer frame. */
@media (max-height: 760px) and (min-width: 640px) {
  .ds-hero { padding-top: 40px; }
  .ds-hero-title { font-size: var(--ds-text-heading-1); }
  .ds-hero-stage { margin-top: var(--ds-space-2xl); }
}
@media (max-height: 480px) and (min-width: 640px) {
  .ds-hero { padding-top: var(--ds-space-2xl); }
  .ds-hero-title { font-size: var(--ds-text-heading-2); }
  .ds-hero-stage { margin-top: var(--ds-space-xl); }
}
/* The teams: both top corners stepped in three 3px pixels, the rule's grey under a ground 1px in, so a hairline runs
   up the sides and round the top and meets the frame's rule at the foot. Idle grey, darkening under the pointer as
   the pattern takes the red; the picked one red, its name and pattern off-white. */
.ds-hero-tab { color: var(--ds-color-neutral-400); cursor: pointer; transition: color var(--ds-duration-rise) var(--ds-easing-standard); }
.ds-hero-tab :is(.ds-hero-tab-edge, .ds-hero-tab-ground) { clip-path: polygon(0 9px, 3px 9px, 3px 6px, 6px 6px, 6px 3px, 9px 3px, 9px 0, calc(100% - 9px) 0, calc(100% - 9px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 6px, calc(100% - 3px) 6px, calc(100% - 3px) 9px, 100% 9px, 100% 100%, 0 100%); }
.ds-hero-tab-edge { background: var(--ds-color-neutral-600); }
.ds-hero-tab-ground { background: var(--ds-color-home-grey); transition: background-color var(--ds-duration-rise) var(--ds-easing-standard); }
.ds-hero-tab-mark { color: var(--ds-color-neutral-500); transition: color var(--ds-duration-rise) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-hero-tab:not([data-on="true"]):hover { color: var(--ds-color-off-black); }
  .ds-hero-tab:not([data-on="true"]):hover .ds-hero-tab-ground { background: color-mix(in srgb, var(--ds-color-neutral-700) 45%, var(--ds-color-home-grey)); }
  .ds-hero-tab:not([data-on="true"]):hover .ds-hero-tab-mark { color: var(--ds-color-home-red); }
}
.ds-hero-tab[data-on="true"] { color: var(--ds-color-off-white); }
.ds-hero-tab[data-on="true"] .ds-hero-tab-ground { background: var(--ds-color-home-red); }
.ds-hero-tab[data-on="true"] .ds-hero-tab-mark { color: var(--ds-color-off-white); }
.ds-hero-tab:focus-visible { outline-offset: -2px; }
/* The timer: a line filling along the picked tab's foot, linear over the turn, paused off screen and under a resting
   pointer. Reduced motion: no auto-advance, the line sits full. */
.ds-hero-fill { transform: scaleX(0); transform-origin: left; animation: ds-hero-fill var(--turn) linear forwards; animation-play-state: paused; }
.ds-hero-stage[data-running="true"] .ds-hero-fill { animation-play-state: running; }
@media (hover: hover) and (pointer: fine) { .ds-hero-stage[data-running="true"]:hover .ds-hero-fill { animation-play-state: paused; } }
@keyframes ds-hero-fill { to { transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .ds-settle { animation-name: ds-settle-fade; }
  .ds-hero-tab, .ds-hero-tab-ground, .ds-hero-tab-mark { transition: none; }
  .ds-hero-fill { animation: none; transform: none; }
}
@keyframes ds-settle-fade { from { opacity: 0; } }
</style>
