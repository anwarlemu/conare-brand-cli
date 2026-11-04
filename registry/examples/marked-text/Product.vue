<script setup lang="ts">
import MarkedText from '@/components/ui/MarkedText.vue'
// A passage from a contract, marked for the question asked of it.
const text = 'Either party may terminate this agreement by giving ninety days written notice. The notice period starts on the day the other party receives it.'
</script>

<template>
  <p class="max-w-140 type-ui text-fg-soft"><MarkedText :text="text" query="notice period to terminate" /></p>
</template>
