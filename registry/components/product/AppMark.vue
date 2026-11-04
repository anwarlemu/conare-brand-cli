<script setup lang="ts">
import { computed } from 'vue'

// An app's mark beside its name: the app's own logo when `logo` is given, otherwise a square tile in a hairline with
// the name's initial, never a round one. `size` in px (16 in rows, 20 in tiles).
const props = withDefaults(defineProps<{ name: string, logo?: string | null, size?: number }>(), { size: 16 })
const box = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }))
</script>

<template>
  <img v-if="logo" :src="logo" alt="" :width="size" :height="size" class="shrink-0 object-contain" :style="box" loading="lazy" decoding="async">
  <span v-else class="inline-flex shrink-0 items-center justify-center border border-edge bg-surface-subtle text-tag leading-none font-medium text-fg-soft" :style="box" aria-hidden="true">{{ name.charAt(0).toUpperCase() }}</span>
</template>
