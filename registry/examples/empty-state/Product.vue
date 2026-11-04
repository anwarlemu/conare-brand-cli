<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
// Nothing to search yet, with the two ways to fix it.
</script>

<template>
  <EmptyState title="Nothing to search yet.">
    <Button>Connect an app</Button>
    <Button variant="dark">Add a sample</Button>
  </EmptyState>
</template>
