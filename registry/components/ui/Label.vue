<script setup lang="ts">
// Field's label on its own (console2.css forms): 12px in the soft grey, over or beside the control it names, never in
// place of one. `for` ties it to the control's id; `hint` adds a muted note after it, such as "optional".
defineProps<{ for?: string, hint?: string }>()
</script>

<template>
  <label :for="$props.for" class="inline-flex items-baseline gap-1.5 type-meta text-fg-soft"><slot /><span v-if="hint" class="text-fg-muted">{{ hint }}</span></label>
</template>
