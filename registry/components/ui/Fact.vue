<script setup lang="ts">
// One fact: a 24px hairline box, 12px, the name muted and the value in ink. Inside Facts (a <dl>).
defineProps<{ name: string, value?: string, mono?: boolean }>()
</script>

<template>
  <div class="flex min-w-0 items-center gap-1.5 border border-edge bg-surface px-2 py-1 type-meta">
    <dt class="text-fg-muted">{{ name }}</dt>
    <dd class="min-w-0" :class="mono && 'font-code'"><slot>{{ value }}</slot></dd>
  </div>
</template>
