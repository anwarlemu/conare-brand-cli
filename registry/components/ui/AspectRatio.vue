<script setup lang="ts">
// A box that keeps its shape as it grows (CSS aspect-ratio), for a picture or a window that must not reflow: the blog
// card's 5:4 picture, the hero's 2:1 frame. `ratio` is width over height; the content fills it.
withDefaults(defineProps<{ ratio?: number }>(), { ratio: 1 })
</script>

<template>
  <div data-ds="aspect-ratio" class="relative w-full overflow-hidden" :style="{ aspectRatio: String(ratio) }">
    <slot />
  </div>
</template>
