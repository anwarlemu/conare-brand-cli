<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

// A whole card that opens something (console2.css .v2-door): a way in, such as Connect an app or Send by API. Its
// border turns ink under the pointer and while what it opens is open (`expanded`). One link or one button, never a
// clickable div.
defineProps<{ title: string, description?: string, icon?: Component, href?: string, arrow?: boolean, expanded?: boolean }>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    :aria-expanded="href ? undefined : expanded"
    class="flex cursor-pointer flex-col gap-1 border border-edge bg-surface p-3 text-left transition-[border-color,background-color] duration-120 ease-standard hover:border-edge-focus active:bg-surface-subtle aria-expanded:border-edge-focus"
  >
    <span class="flex items-center gap-2 type-ui-strong">
      <component :is="icon" v-if="icon" :size="14" :stroke-width="1.5" aria-hidden="true" />{{ title }}
      <ArrowRight v-if="arrow" :size="12" :stroke-width="1.5" class="ml-auto text-fg-muted" aria-hidden="true" />
    </span>
    <span v-if="description || $slots.default" class="type-meta text-fg-muted"><slot>{{ description }}</slot></span>
  </component>
</template>
