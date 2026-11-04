<script setup lang="ts">
import type { Component } from 'vue'
import { Slash } from 'lucide-vue-next'

// Where you are (console2.css .v2-crumb): each step back a link in muted text that turns ink under the pointer, a 10px
// slash between, the page itself in ink and the only step that truncates. `mono` sets a namespace or an ID in Geist
// Mono. `as` renders a router link component for the steps back (it gets `href` and `to`).
export interface Crumb { label: string, href?: string, mono?: boolean }
withDefaults(defineProps<{ items: Crumb[], label?: string, as?: string | Component }>(), { label: 'breadcrumb', as: 'a' })
defineEmits<{ navigate: [crumb: Crumb, event: MouseEvent] }>()
</script>

<template>
  <nav class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-meta leading-5" :aria-label="label">
    <template v-for="(crumb, i) in items" :key="i">
      <Slash v-if="i > 0" :size="10" :stroke-width="1.5" class="shrink-0 text-fg-faint" aria-hidden="true" />
      <component :is="as" v-if="i < items.length - 1" :href="crumb.href ?? '#'" :to="crumb.href" class="ds-crumb shrink-0" :class="crumb.mono && 'type-code-sm'" @click="$emit('navigate', crumb, $event)">{{ crumb.label }}</component>
      <span v-else class="truncate text-fg" :class="crumb.mono && 'type-code-sm'" aria-current="page">{{ crumb.label }}</span>
    </template>
  </nav>
</template>

<style>
.ds-crumb { color: var(--ds-color-fg-muted); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-crumb:hover { color: var(--ds-color-fg); } }
.ds-crumb:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
</style>
