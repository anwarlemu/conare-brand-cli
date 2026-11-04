<script setup lang="ts">
defineProps<{ id: string, title: string }>()
</script>

<template>
  <h2 :id="id" class="scroll-mt-16 type-heading-3 md:scroll-mt-6">{{ title }}</h2>
</template>
