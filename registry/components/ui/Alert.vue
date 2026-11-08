<script setup lang="ts">
// A red box for what broke (console2.css .v2-banner-row): one box per problem, the problem in words (its subject in
// ink, medium) and the button that fixes it. A 6px red square leads it. Stack several in a column 8px apart, one each.
defineProps<{ title: string }>()
</script>

<template>
  <div data-ds="alert" class="flex flex-wrap items-center gap-x-3 gap-y-2.5 border border-home-red-press bg-surface-danger py-2.5 pr-3 pl-4 text-fg-danger max-md:items-start max-md:p-3" role="alert">
    <span class="size-1.5 shrink-0 bg-home-red-press max-md:mt-1.75" aria-hidden="true" />
    <p class="min-w-0 flex-1 max-md:basis-[calc(100%-48px)]"><span class="font-medium text-fg">{{ title }}</span> <slot /></p>
    <div v-if="$slots.action" class="shrink-0"><slot name="action" /></div>
  </div>
</template>
