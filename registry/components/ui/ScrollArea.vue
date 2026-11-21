<script setup lang="ts">
// A region that scrolls on its own with the console's thin scrollbars (main.css html: scrollbar-width thin, the thumb
// in neutral-600 on a clear track; on the dark window, neutral-400 as .v2-agentwin-code). Native scrolling, so wheel,
// touch and keyboard all work; with a `label` it is a named region a keyboard can reach. `maxHeight` caps it; `axis`
// picks the direction.
withDefaults(defineProps<{ label?: string, maxHeight?: string, axis?: 'y' | 'x' | 'both', tone?: 'default' | 'dark' }>(), { axis: 'y', tone: 'default' })
</script>

<template>
  <div data-ds="scroll-area"
    class="ds-scroll overscroll-contain"
    :class="{ 'fade-y overflow-y-auto overflow-x-hidden': axis === 'y', 'fade-x overflow-x-auto overflow-y-hidden': axis === 'x', 'fade-xy overflow-auto': axis === 'both' }"
    :data-tone="tone"
    :style="maxHeight ? { maxHeight } : undefined"
    :role="label ? 'region' : undefined"
    :aria-label="label"
    :tabindex="label ? 0 : undefined"
  >
    <slot />
  </div>
</template>

<style>
.ds-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-neutral-600) transparent; }
.ds-scroll[data-tone="dark"] { scrollbar-color: var(--ds-color-neutral-400) transparent; }
.ds-scroll:focus-visible { outline-offset: calc(var(--ds-border-focus) * -1); }
</style>
