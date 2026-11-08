<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import Grain from '@/components/visuals/Grain.vue'
import { useGlideMark } from '@/composables/useGlideMark'

// The website header's Product dropdown (home/ProductMenu.vue): one column of the products with their one line, a
// rule, then the extra links (benchmarks, pricing), beside a portrait of the one under the pointer or focus on the dark
// grained panel, crossfading between items and playing again each time it shows (slot `window`). One highlight, the
// paper with a red square at its left, glides between items (glide-mark's useGlideMark, 160ms) while the item's title eases right to clear the
// square; it rests on the portrait's item when the pointer leaves the list. It opens on hover for a mouse and on
// press for touch and the keyboard; Escape (focus back on the button) or a press outside closes it. `current` gives the
// button the header's resting block and red square. Render it as an item of the header's link list.
export interface ProductMenuItem { label: string, desc: string, href: string }
const props = withDefaults(defineProps<{ items: ProductMenuItem[], more?: ProductMenuItem[], label?: string, current?: boolean }>(), { more: () => [], label: 'Product' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLElement | null>(null)
const id = `product-menu-${useId()}`

// The portrait's item: the last one pointed at, back to the first on each opening. Each change bumps `plays`.
const pick = ref(0)
const plays = ref(0)
// One highlight for the list, resting on the portrait's item when the pointer leaves.
const { mark, shown, instant, hot, point, leave: rest, settle } = useGlideMark(list, () => pick.value)
watch(hot, (i) => {
  if (i === null || i === pick.value) return
  pick.value = i
  plays.value += 1
})
// The portraits are built the first time the menu opens, not with the page.
const opened = ref(false)
watch(open, (o) => {
  if (!o) return
  opened.value = true
  pick.value = 0
  plays.value += 1
  void nextTick(settle)
})

function leave(event?: FocusEvent) {
  if (event && (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) return
  rest()
}

function onPointerDown(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) open.value = false
}
// Pointer activation toggles on pointerdown; detail 0 is the keyboard or assistive technology.
function onClick(event: MouseEvent) { if (event.detail === 0) open.value = !open.value }
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  open.value = false
  button.value?.focus()
}
function hover(event: PointerEvent, now: boolean) { if (event.pointerType === 'mouse') open.value = now }
onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
const all = () => [...props.items, ...props.more]
</script>

<template>
  <li ref="root" class="relative flex" @pointerenter="hover($event, true)" @pointerleave="hover($event, false)">
    <button
      ref="button"
      type="button"
      :aria-expanded="open"
      :aria-controls="id"
      data-nav-item
      :aria-current="current ? 'location' : undefined"
      class="ds-navlink-site relative flex cursor-pointer items-center gap-1 py-2 hover:text-fg"
      :class="[{ 'text-fg': open || current }, current ? 'px-2.75' : 'px-4']"
      @pointerdown="open = !open"
      @click="onClick"
    >
      <span v-if="current" aria-hidden="true" class="size-1.5 shrink-0 bg-home-red" />
      {{ label }}
      <ChevronDown :size="14" :stroke-width="1.5" aria-hidden="true" class="transition-[rotate] duration-200 ease-out motion-reduce:transition-none" :class="open && 'rotate-180'" />
    </button>

    <!-- pt-3 bridges the gap so the pointer can travel into the panel. -->
    <div :id="id" :hidden="!open" class="absolute top-full left-1/2 z-30 -translate-x-1/2 pt-3">
      <div class="grid w-160 max-w-[calc(100vw-32px)] grid-cols-2 gap-px border border-edge bg-edge">
        <div class="bg-surface p-2">
          <p class="ds-product-menu-label px-3 pt-2 pb-1 text-meta text-fg-muted">{{ label }}</p>
          <ul ref="list" class="relative" @mouseleave="leave()" @focusout="leave">
            <li
              v-if="mark"
              aria-hidden="true"
              class="ds-product-mark pointer-events-none absolute inset-x-0 top-0 bg-surface-subtle"
              :data-shown="shown || undefined"
              :data-instant="instant || undefined"
              :style="{ height: `${mark.h}px`, transform: `translateY(${mark.y}px)` }"
            >
              <span class="ds-product-dot absolute top-3.5 left-3 size-2 bg-home-red" />
            </li>
            <template v-for="(item, i) in all()" :key="item.label">
              <li v-if="i === items.length && more.length" aria-hidden="true" class="mx-3 my-1 border-t border-edge" />
              <li class="relative" data-glide-row>
                <a :href="item.href" class="block px-3 py-2 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus" @mouseenter="point(i)" @focus="point(i)" @click="open = false">
                  <span class="ds-product-text block text-body leading-5 font-medium text-fg" :data-hot="hot === i || undefined">{{ item.label }}</span>
                  <span class="block text-ui leading-5 text-fg-muted">{{ item.desc }}</span>
                </a>
              </li>
            </template>
          </ul>
        </div>
        <!-- The portrait, as wide as the list: each item's window on the grained dark grey, crossfaded. -->
        <div class="bg-surface p-2">
          <div aria-hidden="true" class="relative grid h-full min-h-62.5 grid-cols-[minmax(0,1fr)] overflow-hidden bg-ds-neutral-200 text-ds-neutral-300">
            <Grain />
            <template v-if="opened">
              <div v-for="(item, i) in all()" :key="item.label" class="ds-product-art relative flex items-center justify-center px-3 py-4 [grid-area:1/1]" :data-active="i === pick || undefined">
                <slot name="window" :item="item" :index="i" :active="open && i === pick" :plays="plays">
                  <div class="relative w-full max-w-60 border border-ds-neutral-300 bg-ds-neutral-100 text-off-white">
                    <div class="flex h-6 items-center gap-1 border-b border-ds-neutral-300 px-2"><i v-for="k in 3" :key="k" class="size-1.5 bg-ds-neutral-300" /></div>
                    <div class="flex flex-col gap-1 p-3"><span class="type-code-sm">{{ item.label.toLowerCase() }}</span><span class="type-meta text-ds-neutral-500">{{ item.desc }}</span></div>
                  </div>
                </slot>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<style>
/* The menu's small label: the website's capitals, 12px at 0.06em (home.css .label with uppercase). */
.ds-product-menu-label { letter-spacing: var(--ds-tracking-tag); text-transform: uppercase; }
.ds-navlink-site { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-navlink-site:active { background: var(--ds-color-surface-subtle); }
.ds-navlink-site:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
/* The highlight glides between items and fades when the pointer leaves the list; arriving from outside it fades in
   where it lands, without the slide. Its red square grows in, and the hovered title eases right of it. */
.ds-product-mark { opacity: 0; transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-product-mark[data-shown] { opacity: 1; }
.ds-product-mark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-product-dot { opacity: 0; transform: scale(0.5); transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-product-mark[data-shown] .ds-product-dot { opacity: 1; transform: none; }
.ds-product-text { transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-product-text[data-hot] { transform: translateX(16px); }
/* Windows crossfade, a little quicker out than in; the one being left freezes where it is. */
.ds-product-art { opacity: 0; transition: opacity var(--ds-duration-cell) ease; }
.ds-product-art[data-active] { opacity: 1; transition-duration: var(--ds-duration-micro); }
.ds-product-art:not([data-active]) * { animation-play-state: paused !important; }
@media (prefers-reduced-motion: reduce) {
  .ds-product-mark, .ds-product-dot { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
  .ds-product-text { transition: none; }
}
</style>
