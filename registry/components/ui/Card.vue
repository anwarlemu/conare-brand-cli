<script setup lang="ts">
import { useId } from 'vue'

// A bordered box for one subject (console2.css .v2-card): a head with its title and actions over a hairline, then the
// body. Square, no shadow. `framed` adds the website's double rule, a second hairline 4px outside, for the one block a
// page leads with. `flush` drops the body's padding, for a table that runs to the edges.
const props = defineProps<{ title?: string, framed?: boolean, flush?: boolean }>()
const titleId = `card-${useId()}`
</script>

<template>
  <section data-ds="card" class="border border-edge bg-surface" :class="framed && 'outline outline-offset-4 outline-edge'" :aria-labelledby="props.title ? titleId : undefined">
    <div v-if="title || $slots.actions" class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3">
      <h3 v-if="title" :id="titleId" class="type-ui-strong">{{ title }}</h3>
      <div v-if="$slots.actions" class="flex items-center gap-2 type-meta text-fg-muted"><slot name="actions" /></div>
    </div>
    <div :class="!flush && 'p-4'"><slot /></div>
  </section>
</template>
