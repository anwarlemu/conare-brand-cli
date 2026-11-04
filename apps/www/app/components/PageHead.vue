<script setup lang="ts">
// A page's head, as the console's pages open: the title in Faculty Glyphic, a line under it, then what the page holds.
defineProps<{ title: string, eyebrow?: string, description?: string }>()
</script>

<template>
  <header class="flex flex-col gap-3">
    <p v-if="eyebrow" class="type-meta text-fg-muted">{{ eyebrow }}</p>
    <h1 class="type-heading-3">{{ title }}</h1>
    <p v-if="description" class="max-w-170 type-body text-fg-soft">{{ description }}</p>
    <slot />
  </header>
</template>
