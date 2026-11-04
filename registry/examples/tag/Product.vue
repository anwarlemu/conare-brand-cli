<script setup lang="ts">
import StatusTag from '@/components/ui/StatusTag.vue'
import Tag from '@/components/ui/Tag.vue'
// A source's states, and the quiet tags beside them.
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">A state</p>
    <div class="flex min-h-7 flex-wrap items-center gap-2">
      <StatusTag status="ready" />
      <StatusTag status="syncing" />
      <StatusTag status="connecting" />
      <StatusTag status="error" />
    </div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">A note</p>
    <div class="flex min-h-7 flex-wrap items-center gap-2">
      <Tag tone="quiet">default</Tag>
      <Tag tone="quiet">invited</Tag>
    </div>
  </div>
</template>
