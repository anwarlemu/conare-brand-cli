<script setup lang="ts">
// The frame of every console page (Page.vue, .v2-page .v2-page-wide): 1120px at most, 32px down and 16px in on a
// phone (40px and 32px from 768px), the title in Faculty Glyphic 20px (or Geist Mono when it is an identifier, shown
// as typed), the page's actions on the right, then the body in 24px steps.
defineProps<{ title: string, mono?: boolean }>()
</script>

<template>
  <div data-ds="console-page" class="mx-auto w-full max-w-page-wide px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <header class="mb-6 flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <h1 class="min-w-0" :class="mono ? 'font-code text-heading-3 leading-8 font-medium [overflow-wrap:anywhere]' : 'type-heading-3'">{{ title }}</h1>
        <slot name="meta" />
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div class="flex flex-col gap-6">
      <slot />
    </div>
  </div>
</template>
