<script setup lang="ts">
import CopyButton from '@/components/ui/CopyButton.vue'
// Beside an endpoint.
</script>

<template>
  <div class="flex min-w-0 items-center gap-2">
    <span class="truncate type-code-sm">https://api.conare.ai/mcp</span>
    <CopyButton text="https://api.conare.ai/mcp" class="shrink-0" />
  </div>
</template>
