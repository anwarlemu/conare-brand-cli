<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import SiteTag from '@/components/ui/SiteTag.vue'

// The website's questions in the double-rule frame (Faq.vue). From md, the list and one answer beside it: every
// answer shares one grid cell, so the panel is as tall as the longest and opening a question never pushes the page.
// The open question keeps its ground (paper, the red square) and glides to the next one opened on transform alone;
// the pointer has its own lighter ground that follows it across the other questions, appears where the pointer is
// and fades when it leaves. Arrow keys, Home and End move between questions. On phones it is an accordion: each
// answer opens under its question, one at a time, a second tap closes it, and a red plus turns to a minus.
const props = withDefaults(defineProps<{ items: { q: string, a: string }[], title?: string, tag?: string }>(), { title: 'Frequently asked questions', tag: 'FAQ' })
const uid = useId()

const active = ref(0)
const open = ref<number | null>(0)
const hot = ref<number | null>(null)
const tabEls = ref<HTMLButtonElement[]>([])
const rows = ref<{ y: number, h: number }[]>([])
const rowClasses = computed(() => props.items.map((_, i) => [i === active.value || i === hot.value ? 'text-fg' : 'text-fg-muted', { 'bg-surface-subtle': i === active.value && !rows.value.length }]))
const hovering = computed(() => hot.value !== null && hot.value !== active.value)
// Set for a frame when the pointer's ground appears, so it starts where it is instead of gliding in.
const snap = ref(false)
let ro: ResizeObserver | undefined

function measure() {
  rows.value = tabEls.value.map(el => ({ y: el.offsetTop, h: el.offsetHeight }))
}

watch(hovering, (on, was) => {
  if (on && !was) {
    snap.value = true
    requestAnimationFrame(() => requestAnimationFrame(() => { snap.value = false }))
  }
})

onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  tabEls.value.forEach(t => ro?.observe(t))
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.items.length, () => nextTick(measure))

function onKey(e: KeyboardEvent) {
  const n = props.items.length
  const next = e.key === 'ArrowDown' ? (active.value + 1) % n : e.key === 'ArrowUp' ? (active.value - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
  if (next === null) return
  e.preventDefault()
  active.value = next
  tabEls.value[next]?.focus()
}
</script>

<template>
  <section :aria-labelledby="`${uid}-title`" class="mx-auto max-w-[1440px] scroll-mt-16 px-4 pt-12 pb-32 sm:px-6 lg:px-10 lg:pt-16 lg:pb-40">
    <div class="mx-auto max-w-[1200px]">
      <p class="mb-4 flex justify-center"><SiteTag>{{ tag }}</SiteTag></p>
      <h2 :id="`${uid}-title`" class="ds-faq-title text-center font-heading text-heading-2 font-normal tracking-tight sm:text-heading-1">{{ title }}</h2>

      <!-- Phones: the accordion, in the same double rule. -->
      <ul class="mt-8 border border-edge outline outline-offset-4 outline-edge md:hidden">
        <li v-for="(f, i) in items" :key="f.q" class="ds-faq-item border-t border-edge first:border-t-0" :data-open="i === open">
          <h3 class="font-heading font-normal">
            <button
              :id="`${uid}-q-${i}`"
              type="button"
              :aria-expanded="i === open"
              :aria-controls="`${uid}-a-${i}`"
              class="ds-faq-row relative flex w-full items-center justify-between gap-4 py-4 pr-5 pl-5 text-left text-body-lg"
              :class="i === open ? 'text-fg' : 'text-fg-muted'"
              @click="open = i === open ? null : i"
            >
              {{ f.q }}
              <span aria-hidden="true" class="relative size-3 shrink-0">
                <span class="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-home-red" />
                <span class="ds-faq-sign-v absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-home-red" />
              </span>
            </button>
          </h3>
          <div :id="`${uid}-a-${i}`" role="region" :aria-labelledby="`${uid}-q-${i}`" :inert="i !== open" :data-open="i === open" class="ds-faq-acc grid">
            <div class="min-h-0 overflow-hidden">
              <p class="px-5 pb-5 text-input leading-6.5 text-fg-muted">{{ f.a }}</p>
            </div>
          </div>
        </li>
      </ul>

      <!-- From md: the list and the answer beside it, in the double rule. -->
      <div class="mt-8 hidden border border-edge outline outline-offset-4 outline-edge md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div role="tablist" :aria-label="title" aria-orientation="vertical" class="relative flex flex-col border-b border-edge md:border-r md:border-b-0" @keydown="onKey" @mouseleave="hot = null">
          <!-- Until the rows are measured the open row carries its own ground, so the first paint is right. -->
          <template v-if="rows.length">
            <span
              aria-hidden="true"
              class="ds-faq-hover pointer-events-none absolute inset-x-0 top-0 bg-home-grey"
              :data-on="hovering"
              :data-snap="snap"
              :style="{ height: `${rows[hot ?? active]!.h}px`, transform: `translateY(${rows[hot ?? active]!.y}px)` }"
            />
            <span
              aria-hidden="true"
              class="ds-faq-mark pointer-events-none absolute inset-x-0 top-0 flex items-center justify-end bg-surface-subtle pr-5 sm:pr-6"
              :style="{ height: `${rows[active]!.h}px`, transform: `translateY(${rows[active]!.y}px)` }"
            ><span class="size-2 bg-home-red" /></span>
          </template>
          <button
            v-for="(f, i) in items"
            :id="`${uid}-tab-${i}`"
            :key="f.q"
            ref="tabEls"
            role="tab"
            type="button"
            :aria-controls="`${uid}-panel-${i}`"
            :aria-selected="i === active"
            :tabindex="i === active ? 0 : -1"
            class="ds-faq-row relative border-t border-edge py-4 pr-12 pl-5 text-left text-body-lg first:border-t-0 sm:pl-6"
            :class="rowClasses[i]"
            @mouseenter="hot = i"
            @pointerdown.left="active = i"
            @click="active = i"
          >
            {{ f.q }}
          </button>
        </div>

        <div class="grid grid-cols-[minmax(0,1fr)]">
          <div
            v-for="(f, i) in items"
            :id="`${uid}-panel-${i}`"
            :key="f.q"
            role="tabpanel"
            :aria-labelledby="`${uid}-tab-${i}`"
            :inert="i !== active"
            :data-active="i === active"
            class="ds-faq-panel min-w-0 px-5 py-6 [grid-area:1/1] sm:px-8 sm:py-8"
          >
            <p class="type-heading-3 text-fg">{{ f.q }}</p>
            <p class="mt-3 max-w-[560px] text-input leading-6.5 text-fg-muted">{{ f.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.ds-faq-title { line-height: 1.2; text-wrap: balance; }
/* The answers swap without a pause; the short fade keeps frequent picks quiet (home.css .faq-panel). */
.ds-faq-panel { opacity: 0; transform: translateY(4px); visibility: hidden; transition: opacity var(--ds-duration-answer-out) ease, visibility 0s linear var(--ds-duration-answer-out); }
.ds-faq-panel[data-active="true"] { opacity: 1; transform: none; visibility: visible; transition: opacity var(--ds-duration-micro) ease, visibility 0s; }
/* Both grounds move on transform only; the pointer's fades in where it is. */
.ds-faq-mark { transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-faq-hover { opacity: 0; transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-faq-hover[data-on="true"] { opacity: 1; }
.ds-faq-hover[data-snap="true"] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-faq-row { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-faq-row:active { background-color: var(--ds-color-surface-subtle); }
/* The phone accordion, on the swap curve: the answer opens by its row's height while its words fade up a beat
   later, the row's ground comes in with it, and the plus's upright turns flat. Closing, the words go first. */
.ds-faq-item { transition: background-color var(--ds-duration-unfold) var(--ds-easing-swap); }
.ds-faq-item[data-open="true"] { background-color: var(--ds-color-surface-subtle); }
.ds-faq-acc { grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-unfold) var(--ds-easing-swap); }
.ds-faq-acc[data-open="true"] { grid-template-rows: 1fr; }
.ds-faq-acc p { opacity: 0; transform: translateY(-4px); transition: opacity var(--ds-duration-glide) var(--ds-easing-swap), transform var(--ds-duration-glide) var(--ds-easing-swap); }
.ds-faq-acc[data-open="true"] p { opacity: 1; transform: none; transition: opacity var(--ds-duration-words) var(--ds-easing-swap) 120ms, transform var(--ds-duration-words) var(--ds-easing-swap) 120ms; }
.ds-faq-sign-v { transition: rotate var(--ds-duration-unfold) var(--ds-easing-swap); }
.ds-faq-item[data-open="true"] .ds-faq-sign-v { rotate: 90deg; }
@media (prefers-reduced-motion: reduce) {
  .ds-faq-panel, .ds-faq-panel[data-active="true"], .ds-faq-mark, .ds-faq-hover, .ds-faq-hover[data-snap="true"], .ds-faq-acc, .ds-faq-item, .ds-faq-sign-v, .ds-faq-row { transition: none; }
  .ds-faq-panel { transform: none; }
  .ds-faq-acc p, .ds-faq-acc[data-open="true"] p { transform: none; transition: opacity var(--ds-duration-micro) ease; }
}
</style>
