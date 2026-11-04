<script setup lang="ts">
import { computed, ref } from 'vue'

// Who or what something belongs to, always square (never round). `tile` (console2.css .v2-tile, the workspace
// switcher's organization): a 20px hairline box with the name's initial, 11px medium. `solid` (AccountMenu.vue): the
// black square that stands in for a profile picture; with `initial` it carries the letter in off-white. A `src` shows a
// picture cropped square, falling back to the initial if it fails. Sizes follow the controls: 20 (in a row), 28, 32.
const props = withDefaults(defineProps<{ name?: string, src?: string, variant?: 'tile' | 'solid', size?: 20 | 28 | 32, initial?: boolean }>(), { variant: 'tile', size: 20 })
const failed = ref(false)
const letter = computed(() => (props.name?.trim()[0] ?? '').toUpperCase())
const showLetter = computed(() => props.variant === 'tile' || props.initial)
const SIZES = { 20: 'size-5 text-caption', 28: 'size-7 text-meta', 32: 'size-8 text-ui' }
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden leading-none font-medium select-none"
    :class="[SIZES[size], variant === 'tile' ? 'border border-edge bg-surface text-fg' : 'bg-off-black text-off-white']"
    :role="name ? 'img' : undefined"
    :aria-label="name"
    :aria-hidden="name ? undefined : 'true'"
  >
    <img v-if="src && !failed" :src="src" alt="" class="size-full object-cover" @error="failed = true">
    <template v-else-if="showLetter">{{ letter }}</template>
  </span>
</template>
