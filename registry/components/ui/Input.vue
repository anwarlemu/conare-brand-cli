<script setup lang="ts">
import type { Component } from 'vue'

// A text field (console2.css .v2-input): 32px, a #C3C1BF hairline that turns ink on focus, 13px text and a muted
// placeholder. `icon` puts a 12px Lucide glyph at the start and makes it the 28px filter size. aria-invalid turns the
// border red; Field shows the message. 40px and 16px on phones, so iOS does not zoom.
defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
defineProps<{ icon?: Component, invalid?: boolean }>()
</script>

<template>
  <span v-if="icon" class="relative block w-full">
    <component :is="icon" :size="12" :stroke-width="1.5" class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
    <input
      v-model="model"
      v-bind="$attrs"
      :aria-invalid="invalid || undefined"
      class="h-control-sm w-full border border-edge-strong bg-surface pr-2.5 pl-7 text-meta leading-5 text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch pointer-coarse:text-input"
    >
  </span>
  <input
    v-else
    v-model="model"
    v-bind="$attrs"
    :aria-invalid="invalid || undefined"
    class="h-control-md w-full border border-edge-strong bg-surface px-2.5 text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch pointer-coarse:text-input"
  >
</template>
