<script setup lang="ts">
import CopyText from '@/components/ui/CopyText.vue'
// A key's ID and a custom model, as the keys and models pages list them.
</script>

<template>
  <dl class="grid max-w-120 grid-cols-[96px_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
    <dt class="type-meta text-fg-muted">ID</dt><dd class="min-w-0"><CopyText value="key_01JB7Q4ZK2M8F3" label="key id" /></dd>
    <dt class="type-meta text-fg-muted">Embedder</dt><dd class="min-w-0"><CopyText value="acme-embed-legal-v2" label="embedder model" /></dd>
  </dl>
</template>
