<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

// One row of a card's list (console2.css .v2-row, .v2-row-link): 12px, its title on the left and what it is on the
// right, 8px above and below. With `href` the whole row is one link that fills to the card's edges with the paper
// under the pointer (it runs 16px past its box, a card's inset); `arrow` adds a chevron that darkens with it. Rows in
// a list share a hairline: put them in ItemGroup. Slots: `media` before the title (a logo, a tile), `meta` beside
// it (a tag, a time), and `actions` at the end, on a row without `href` only (a link holds no buttons).
defineProps<{ title?: string, description?: string, href?: string, arrow?: boolean }>()
</script>

<template>
  <a v-if="href" :href="href" class="ds-item-link group/item -mx-4 flex items-center justify-between gap-3 px-4 py-2 text-meta">
    <span class="flex min-w-0 items-center gap-2">
      <slot name="media" />
      <span class="min-w-0">
        <span class="block truncate text-fg"><slot>{{ title }}</slot></span>
        <span v-if="description" class="block truncate text-fg-muted">{{ description }}</span>
      </span>
    </span>
    <span class="flex shrink-0 items-center gap-2 text-fg-muted">
      <slot name="meta" />
      <ChevronRight v-if="arrow" :size="12" :stroke-width="1.5" class="transition-colors duration-120 ease-standard group-hover/item:text-fg" aria-hidden="true" />
    </span>
  </a>
  <div v-else class="flex items-center justify-between gap-3 py-2 text-meta">
    <span class="flex min-w-0 items-center gap-2">
      <slot name="media" />
      <span class="min-w-0">
        <span class="block truncate text-fg"><slot>{{ title }}</slot></span>
        <span v-if="description" class="block truncate text-fg-muted">{{ description }}</span>
      </span>
    </span>
    <span v-if="$slots.meta || $slots.actions" class="flex shrink-0 items-center gap-2 text-fg-muted">
      <slot name="meta" />
      <slot name="actions" />
    </span>
  </div>
</template>

<style>
.ds-item-link { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-item-link:hover { background: var(--ds-color-surface-subtle); } }
.ds-item-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
</style>
