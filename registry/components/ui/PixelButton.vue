<script setup lang="ts">
import { ref } from 'vue'
import { usePixelGrid } from '@/composables/usePixelGrid'

// The website's dark button as a console button (console2.css .v2-px): black at rest; on hover a red fill comes in as
// 6px squares from the left with a little scatter and goes out the same way, while the white label holds still. A
// press darkens the squares at once with no change of size. `done` holds the red while an action shows it happened
// (Copied). `large` is the 36px size with the grain, for the one main action of a page. `href` renders a link.
const props = defineProps<{ done?: boolean, large?: boolean, href?: string, type?: 'button' | 'submit', disabled?: boolean }>()
const root = ref<HTMLElement | null>(null)
const { grid, style } = usePixelGrid(() => root.value)
</script>

<template>
  <component data-ds="pixel-button"
    :is="href ? 'a' : 'button'"
    ref="root"
    :href="href"
    :type="href ? undefined : (props.type ?? 'button')"
    :disabled="href ? undefined : disabled"
    class="ds-px"
    :data-done="done ? 'true' : undefined"
    :data-large="large ? 'true' : undefined"
  >
    <span v-if="grid" aria-hidden="true" class="ds-px-fill" :style="style">
      <i v-for="(c, k) in grid.cells" :key="k" :style="c" />
    </span>
    <span class="ds-px-label"><slot /></span>
  </component>
</template>

<style>
.ds-px {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  height: var(--ds-size-control-sm);
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-sm);
  overflow: hidden;
  padding: 0 10px;
  background: var(--ds-color-surface-inverse);
  color: var(--ds-color-off-white);
  font-size: var(--ds-text-meta);
  font-weight: var(--ds-font-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  will-change: transform;
  transition-property: color, background-color;
  transition-duration: var(--ds-duration-micro);
  transition-timing-function: var(--ds-easing-standard);
}
.ds-px:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
.ds-px-fill { position: absolute; inset: 0; z-index: -1; display: grid; pointer-events: none; }
.ds-px-fill i { position: relative; background: var(--ds-color-edge-accent); font-style: normal; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard) calc(var(--o) * 1ms); }
.ds-px-label { display: inline-flex; align-items: center; gap: var(--ds-space-sm); line-height: 1.4; }
@media (hover: hover) and (pointer: fine) {
  .ds-px:hover:not(:disabled) .ds-px-fill i { opacity: 1; transition: opacity var(--ds-duration-cell) var(--ds-easing-decelerate) calc(var(--i) * 1ms); }
}
.ds-px:active:not(:disabled) .ds-px-fill i { background: var(--ds-color-home-red-press); opacity: 1; transition: opacity var(--ds-duration-press) ease 0ms; }
.ds-px:focus-visible .ds-px-fill i,
.ds-px[data-done="true"] .ds-px-fill i { opacity: 1; transition: opacity var(--ds-duration-cell) var(--ds-easing-decelerate) calc(var(--i) * 1ms); }
.ds-px:disabled { background: var(--ds-color-surface-sunken); color: var(--ds-color-fg-soft); cursor: not-allowed; }
.ds-px:disabled .ds-px-fill { display: none; }
.ds-px[data-large="true"] { height: var(--ds-size-control-lg); gap: var(--ds-space-lg); padding: 0 12px; font-size: var(--ds-text-ui); }
.ds-px[data-large="true"]::before { position: absolute; inset: 0; z-index: -1; background-image: url("/conare-ds/textures/grain.webp"); background-size: 170px auto; opacity: 0.3; content: ""; pointer-events: none; }
.ds-px[data-large="true"]:disabled::before { display: none; }
@media (pointer: coarse), (max-width: 767px) {
  .ds-px, .ds-px[data-large="true"] { height: var(--ds-size-control-touch); font-size: var(--ds-text-ui); }
}
@media (prefers-reduced-motion: reduce) {
  .ds-px-fill i, .ds-px:hover .ds-px-fill i { transition: none; }
}
</style>
