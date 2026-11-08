<script setup lang="ts">
import AspectRatio from '@/components/ui/AspectRatio.vue'
// The blog card's 5:4 picture and the hero's 2:1 frame at any width.
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <figure class="flex flex-col gap-2">
      <AspectRatio :ratio="5 / 4" class="bg-ds-neutral-200">
        <span class="absolute inset-0 flex items-center justify-center type-code-sm text-ds-neutral-500">5:4</span>
      </AspectRatio>
      <figcaption class="type-meta text-fg-muted">A blog card's picture</figcaption>
    </figure>
    <figure class="flex flex-col gap-2">
      <AspectRatio :ratio="2" class="bg-home-red">
        <span class="absolute inset-0 flex items-center justify-center type-code-sm text-off-white">2:1</span>
      </AspectRatio>
      <figcaption class="type-meta text-fg-muted">The hero's frame</figcaption>
    </figure>
  </div>
</template>
