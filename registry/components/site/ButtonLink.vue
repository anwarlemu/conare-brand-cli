<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePixelGrid } from '@/composables/usePixelGrid'

// The website's button (home.css .btn-px, ButtonLink.vue): a square link, 36px with a 13px label (28px and 12px when
// small), whose hover is a fill of 6px squares coming in from the left with a little scatter and going out the same
// way; the label never changes size or weight. red is the flat red block (its squares come in black); secondary is
// outlined (its border turns red, the squares red); light and ghost are for a dark band. `pixels` is the dark main
// call to action (black, red squares); `arrow` adds the pixel arrow, lit and still. `grain` lays the footer's grain
// over the button. `fill="black"` brings the squares in black, for a light button on a red band. Where the label
// changes colour over the fill (secondary, light), each column of squares carries its own off-white copy of the label,
// so the label turns as the squares land and never fades through grey.
export type ButtonLinkVariant = 'red' | 'secondary' | 'light' | 'ghost'

const props = withDefaults(defineProps<{
  href: string
  variant?: ButtonLinkVariant
  size?: 'sm' | 'md'
  pixels?: boolean
  arrow?: boolean
  grain?: boolean
  fill?: 'black'
}>(), { variant: 'red', size: 'md' })

const PX = 6
const root = ref<HTMLElement | null>(null)
const { grid, style } = usePixelGrid(() => root.value)
const tone = computed(() => (props.pixels ? 'dark' : props.variant))
const inks = computed(() => !props.pixels && (props.variant === 'secondary' || props.variant === 'light'))
// The copies are made the first time the pointer or focus arrives, from the label's text.
const armed = ref(false)
const label = ref('')
function arm() {
  if (armed.value || !inks.value) return
  label.value = root.value?.querySelector(':scope > .ds-btnlink-label')?.textContent?.trim() ?? ''
  armed.value = true
}
const inkCols = computed(() => {
  const g = grid.value
  if (!g) return []
  return Array.from({ length: g.cols }, (_, c) => ({ col: g.cells[c]!, ink: { width: `${g.w}px`, height: `${g.h}px`, transform: `translateX(${-c * PX}px)` } }))
})
// The arrow's lit cells on a 5 by 5 of dim ones, as [column, row]; each cell is 2px and a 1px gap.
const ARROW = [[2, 0], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [3, 3], [2, 4]] as const
const CELL = 3
</script>

<template>
  <a
    ref="root"
    :href="href"
    class="ds-btnlink"
    :data-variant="tone"
    :data-size="size"
    :data-grain="grain || undefined"
    :data-arrow="arrow || undefined"
    :data-fill="fill"
    @pointerenter="arm"
    @pointerdown="arm"
    @focus="arm"
  >
    <span v-if="grid" aria-hidden="true" class="ds-btnlink-fill" :data-inks="inks || undefined" :style="style">
      <i v-for="(c, k) in grid.cells" :key="k" :style="c" />
    </span>
    <span v-if="grid && inks && armed" aria-hidden="true" class="ds-btnlink-inks" :style="{ gridTemplateColumns: `repeat(${grid.cols}, ${PX}px)` }">
      <i v-for="(c, k) in inkCols" :key="k" :style="c.col"><span class="ds-btnlink-ink" :style="c.ink"><span class="ds-btnlink-label">{{ label }}</span></span></i>
    </span>
    <span class="ds-btnlink-label"><slot /></span>
    <svg v-if="arrow" aria-hidden="true" class="ds-btnlink-arrow" :viewBox="`0 0 ${5 * CELL - 1} ${5 * CELL - 1}`" width="11" height="11">
      <g class="ds-btnlink-arrow-dim">
        <template v-for="c in 5" :key="c">
          <rect v-for="r in 5" :key="r" :x="(c - 1) * CELL" :y="(r - 1) * CELL" :width="CELL - 1" :height="CELL - 1" />
        </template>
      </g>
      <g class="ds-btnlink-arrow-lit">
        <rect v-for="[c, r] in ARROW" :key="`${c}${r}`" :x="c * CELL" :y="r * CELL" :width="CELL - 1" :height="CELL - 1" />
      </g>
    </svg>
  </a>
</template>

<style>
.ds-btnlink {
  --btnlink-fill: var(--ds-color-home-red);
  position: relative;
  isolation: isolate;
  display: inline-flex;
  height: var(--ds-size-control-lg);
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-md);
  overflow: hidden;
  padding: 0 12px;
  border-radius: var(--ds-radius-control);
  font-size: var(--ds-text-ui);
  font-weight: var(--ds-font-weight-medium);
  white-space: nowrap;
  will-change: transform;
  transition: color var(--ds-duration-enter) var(--ds-easing-standard), background-color var(--ds-duration-enter) var(--ds-easing-standard), border-color var(--ds-duration-enter) var(--ds-easing-standard);
}
.ds-btnlink[data-size="sm"] { height: var(--ds-size-control-sm); padding: 0 10px; font-size: var(--ds-text-meta); }
.ds-btnlink[data-arrow] { gap: var(--ds-space-lg); }
.ds-btnlink:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-home-red); outline-offset: var(--ds-border-focus); }
.ds-btnlink[data-variant="red"] { --btnlink-fill: var(--ds-color-off-black); background: var(--ds-color-home-red); color: var(--ds-color-off-white); }
.ds-btnlink[data-variant="secondary"] { border: var(--ds-border-hairline) solid var(--ds-color-neutral-600); color: var(--ds-color-off-black); }
.ds-btnlink[data-variant="light"] { background: var(--ds-color-off-white); color: var(--ds-color-off-black); }
.ds-btnlink[data-variant="ghost"] { border: var(--ds-border-hairline) solid var(--ds-color-neutral-300); color: var(--ds-color-off-white); }
.ds-btnlink[data-variant="dark"] { background: var(--ds-color-off-black); color: var(--ds-color-off-white); }
.ds-btnlink[data-fill="black"] { --btnlink-fill: var(--ds-color-off-black); }
@media (hover: hover) and (pointer: fine) {
  .ds-btnlink:is([data-variant="secondary"], [data-variant="ghost"]):hover { border-color: var(--ds-color-home-red); }
}
.ds-btnlink[data-grain]::before { position: absolute; inset: 0; z-index: -1; background-image: url("/conare-ds/textures/grain.webp"); background-size: 170px auto; opacity: 0.3; content: ""; pointer-events: none; }
.ds-btnlink-label { display: block; line-height: 1.4; }
.ds-btnlink-fill, .ds-btnlink-inks { position: absolute; inset: 0; z-index: -1; display: grid; pointer-events: none; }
.ds-btnlink-fill[data-inks] { z-index: 1; }
.ds-btnlink-inks { z-index: 2; }
.ds-btnlink-fill i, .ds-btnlink-inks i { position: relative; overflow: hidden; font-style: normal; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard) calc(var(--o) * 1ms); }
.ds-btnlink-fill i { background: var(--btnlink-fill); }
.ds-btnlink-ink { position: absolute; top: 0; left: 0; display: flex; align-items: center; justify-content: center; color: var(--ds-color-off-white); white-space: nowrap; }
@media (hover: hover) and (pointer: fine) {
  .ds-btnlink:hover :is(.ds-btnlink-fill, .ds-btnlink-inks) i { opacity: 1; transition: opacity var(--ds-duration-cell) var(--ds-easing-decelerate) calc(var(--i) * 1ms); }
}
.ds-btnlink:active :is(.ds-btnlink-fill, .ds-btnlink-inks) i { opacity: 1; transition: opacity var(--ds-duration-press) ease 0ms; }
.ds-btnlink:focus-visible :is(.ds-btnlink-fill, .ds-btnlink-inks) i { opacity: 1; }
.ds-btnlink-arrow { flex-shrink: 0; }
.ds-btnlink-arrow-dim { fill: color-mix(in srgb, var(--ds-color-off-white) 14%, transparent); }
.ds-btnlink-arrow-lit { fill: var(--ds-color-off-white); }
@media (prefers-reduced-motion: reduce) {
  .ds-btnlink-fill i, .ds-btnlink-inks i, .ds-btnlink:hover :is(.ds-btnlink-fill, .ds-btnlink-inks) i { transition-delay: 0ms !important; }
}
</style>
