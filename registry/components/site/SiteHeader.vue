<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import ProductMenu, { type ProductMenuItem } from '@/components/site/ProductMenu.vue'

// The website header (home/Header.vue): solid off-white, 64px, a hairline under it, three columns so the links sit on
// the page's true center whatever the widths of the logo (slot `logo`) and the buttons (slot `actions`). The links are
// 14px soft, the Product menu first. Two paper blocks glide under them on transform: one rests on the current link
// (`current`, or `productCurrent`) with its red square, the other follows the pointer or focus, appearing in place on
// the first link and fading when it leaves the row. Below 768px the links fold into a sheet under the bar, opened by a
// square button whose 3 by 3 red squares turn into an X: the sheet unrolls on a clip and its rows rise in one after
// another; a link, Escape or a wider window closes it, quickly and all at once. `actions` renders twice, with
// `place` 'bar' or 'sheet'.
export interface SiteLink { label: string, href: string, current?: boolean }
const props = withDefaults(defineProps<{
  items: ProductMenuItem[]
  more?: ProductMenuItem[]
  links: SiteLink[]
  productCurrent?: boolean
  homeHref?: string
  homeLabel?: string
}>(), { more: () => [], homeHref: '/', homeLabel: 'home' })

const menu = ref(false)
const sheetId = `site-menu-${useId()}`
function onKey(event: KeyboardEvent) { if (event.key === 'Escape') menu.value = false }
let mq: MediaQueryList | undefined
const onWide = (event: MediaQueryListEvent) => { if (event.matches) menu.value = false }

// The two blocks: x and width of the item they sit under, drawn as a 1px block scaled to it so only transform moves.
interface Mark { x: number, w: number, shown: boolean, instant: boolean }
const row = ref<HTMLElement | null>(null)
const restMark = ref<Mark | null>(null)
const hoverMark = ref<Mark | null>(null)
function measure(item: HTMLElement, mark: Mark | null): Mark | null {
  if (!row.value) return mark
  return { x: item.getBoundingClientRect().left - row.value.getBoundingClientRect().left, w: item.offsetWidth, shown: true, instant: !mark?.shown }
}
function point(event: Event) {
  const item = (event.target as HTMLElement).closest<HTMLElement>('[data-nav-item]')
  if (item) hoverMark.value = measure(item, hoverMark.value)
}
function rest(instant = false) {
  const here = row.value?.querySelector<HTMLElement>('[data-nav-item][aria-current]')
  if (here) restMark.value = measure(here, instant ? null : restMark.value)
  else if (restMark.value) restMark.value = { ...restMark.value, shown: false }
}
function leave(event?: FocusEvent) {
  if (event && row.value?.contains(event.relatedTarget as Node)) return
  if (hoverMark.value) hoverMark.value = { ...hoverMark.value, shown: false }
}
watch(() => [props.productCurrent, props.links.map(l => l.current)], () => nextTick(() => rest()), { deep: true })

// The page's first frame places the blocks and colors without gliding into them.
const ready = ref(false)
onMounted(() => {
  document.addEventListener('keydown', onKey)
  mq = window.matchMedia('(min-width: 768px)')
  mq.addEventListener('change', onWide)
  rest(true)
  void document.fonts?.ready.then(() => rest(true))
  requestAnimationFrame(() => requestAnimationFrame(() => { ready.value = true }))
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  mq?.removeEventListener('change', onWide)
})
// Pointer activation toggles on pointerdown; detail 0 is the keyboard.
function onMenuClick(event: MouseEvent) { if (event.detail === 0) menu.value = !menu.value }
const markStyle = (m: Mark | null) => (m ? { transform: `translateX(${m.x}px) scaleX(${m.w})` } : undefined)
const rowsBefore = () => props.items.length + props.more.length
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-edge bg-surface" :data-ready="ready || undefined">
    <div class="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
      <a :href="homeHref" :aria-label="homeLabel" class="flex shrink-0 justify-self-start outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-edge-focus"><slot name="logo" /></a>

      <!-- role="navigation" rather than <nav>, as the website's. -->
      <div role="navigation" aria-label="primary" class="hidden md:block">
        <ul ref="row" class="relative flex items-center gap-1 text-body leading-none text-fg-soft" @pointerover="point" @focusin="point" @pointerleave="leave()" @focusout="leave">
          <li
            v-for="(m, k) in [restMark, hoverMark]"
            v-show="m"
            :key="k"
            aria-hidden="true"
            class="ds-site-mark pointer-events-none absolute inset-y-0 left-0 my-auto h-7.5 w-px origin-left bg-surface-subtle"
            :data-shown="m?.shown || undefined"
            :data-instant="m?.instant || undefined"
            :style="markStyle(m)"
          />
          <ProductMenu :items="items" :more="more" :current="productCurrent" />
          <li v-for="link in links" :key="link.label" class="relative flex">
            <a
              :href="link.href"
              data-nav-item
              :aria-current="link.current ? 'page' : undefined"
              class="ds-navlink-site relative flex items-center py-2 hover:text-fg"
              :class="link.current ? 'gap-1.5 px-2.5 text-fg' : 'px-4'"
            >
              <span v-if="link.current" aria-hidden="true" class="size-1.5 shrink-0 bg-home-red" />
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>

      <div class="col-start-3 flex gap-2 justify-self-end">
        <div class="flex gap-2 max-md:hidden"><slot name="actions" place="bar" /></div>
        <button
          type="button"
          class="ds-site-menu-btn flex size-6.5 cursor-pointer items-center justify-center border border-edge-strong text-fg transition-[border-color] duration-200 ease-standard hover:border-edge-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus md:hidden"
          :data-open="menu || undefined"
          :aria-expanded="menu"
          :aria-controls="sheetId"
          :aria-label="menu ? 'Close menu' : 'Open menu'"
          @pointerdown="menu = !menu"
          @click="onMenuClick"
        >
          <span aria-hidden="true" class="ds-site-grid"><i v-for="k in 9" :key="k" :data-edge="k % 2 === 0 || undefined" /></span>
        </button>
      </div>
    </div>

    <!-- The sheet unrolls from under the bar; closed, it is inert, so out of the tab order. -->
    <div :id="sheetId" class="ds-site-sheet absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-edge bg-surface md:hidden" :data-open="menu || undefined" :inert="!menu">
      <div class="mx-auto max-w-[1440px] px-4 pt-4 pb-5 sm:px-6">
        <p class="ds-site-row ds-site-caps px-1 pb-1 text-caption text-fg-muted" style="--i: 0">Product</p>
        <ul class="border-b border-edge pb-3">
          <li v-for="(item, i) in [...items, ...more]" :key="item.label" class="ds-site-row" :style="{ '--i': i + 1 }">
            <a :href="item.href" class="block px-1 py-2" @click="menu = false">
              <span class="block text-body-lg leading-5 font-medium text-fg">{{ item.label }}</span>
              <span class="block text-ui leading-5 text-fg-muted">{{ item.desc }}</span>
            </a>
          </li>
        </ul>
        <ul class="pt-2">
          <li v-for="(link, j) in links" :key="link.label" class="ds-site-row" :style="{ '--i': rowsBefore() + 1 + j }">
            <a :href="link.href" class="block px-1 py-2.5 text-body-lg leading-5 text-fg" :aria-current="link.current ? 'page' : undefined" @click="menu = false">{{ link.label }}</a>
          </li>
        </ul>
        <div class="ds-site-row mt-4 grid grid-cols-2 gap-2" :style="{ '--i': rowsBefore() + links.length + 1 }" @click="menu = false">
          <slot name="actions" place="sheet" />
        </div>
      </div>
    </div>
  </header>
</template>

<style>
.ds-site-caps { letter-spacing: var(--ds-tracking-tag); text-transform: uppercase; }
/* The blocks glide on transform (the Product menu's pace); arriving from outside they fade in where they land. */
.ds-site-mark { opacity: 0; transition: transform var(--ds-duration-glide) var(--ds-easing-standard), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-site-mark[data-shown] { opacity: 1; }
.ds-site-mark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
header:not([data-ready]) :is(.ds-site-mark, .ds-navlink-site) { transition: none; }
.ds-site-menu-btn:active { background: var(--ds-color-surface-subtle); }
/* The menu button's 3 by 3 in red: open, the four edge squares fade away while the corners and center grow from 3px
   to 5px, just enough to meet corner to corner, and the grid turns a quarter, so the five read as an X. */
.ds-site-grid { display: grid; grid-template-columns: repeat(3, 3px); gap: 2px; transition: transform var(--ds-duration-morph) var(--ds-easing-swap); }
.ds-site-grid i { width: 3px; height: 3px; background: var(--ds-color-home-red); transition: transform var(--ds-duration-morph) var(--ds-easing-swap) 80ms, opacity var(--ds-duration-morph) var(--ds-easing-swap) 80ms; }
.ds-site-menu-btn[data-open] .ds-site-grid { transform: rotate(90deg); }
.ds-site-menu-btn[data-open] .ds-site-grid i { transform: scale(1.667); }
.ds-site-menu-btn[data-open] .ds-site-grid i[data-edge] { opacity: 0; transform: scale(0.5); transition-delay: 0ms; }
/* The sheet unrolls downward on a clip (no layout moves) and its rows rise 6px and fade in 28ms apart; closing, it
   rolls back up quickly and all at once. */
.ds-site-sheet { visibility: hidden; clip-path: inset(0 0 100% 0); transition: clip-path var(--ds-duration-exit) var(--ds-easing-standard), visibility 0s linear var(--ds-duration-exit); }
.ds-site-sheet[data-open] { visibility: visible; clip-path: inset(0 0 -1px 0); transition: clip-path var(--ds-duration-entrance) var(--ds-easing-out), visibility 0s; }
.ds-site-row { opacity: 0; transform: translateY(6px); transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform 0s linear var(--ds-duration-exit); }
.ds-site-sheet[data-open] .ds-site-row { opacity: 1; transform: none; transition: opacity var(--ds-duration-entrance) var(--ds-easing-out), transform var(--ds-duration-entrance) var(--ds-easing-out); transition-delay: calc(80ms + var(--i) * 28ms); }
@media (prefers-reduced-motion: reduce) {
  .ds-site-mark, .ds-site-grid, .ds-site-grid i, .ds-site-sheet, .ds-site-sheet[data-open] { transition: none; }
  .ds-site-row, .ds-site-sheet[data-open] .ds-site-row { transform: none; transition: opacity var(--ds-duration-enter) var(--ds-easing-standard); transition-delay: 0ms; }
}
</style>
