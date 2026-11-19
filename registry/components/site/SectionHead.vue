<script setup lang="ts">
import SiteTag from '@/components/ui/SiteTag.vue'

// How the website heads a page or a band (pricing.vue's head, Tag.vue, the blog and the bands of the home): the red tag
// in the site's capitals, then the line in Faculty Glyphic, 24px (32px from 640px) on 1.15 lines, balanced; under it
// one muted line and the one action (`action` slot), each 16px and 32px down. Centred by default; `align="start"`
// starts it at the left, for a head beside its content. `as="h1"` for the page's own head, h2 for a band.
withDefaults(defineProps<{
  title: string
  tag?: string
  body?: string
  as?: 'h1' | 'h2'
  align?: 'center' | 'start'
  titleId?: string
}>(), { as: 'h2', align: 'center' })
</script>

<template>
  <div data-ds="section-head" class="flex flex-col" :class="align === 'center' ? 'items-center text-center' : 'items-start text-left'">
    <p v-if="tag" class="mb-4 flex"><SiteTag>{{ tag }}</SiteTag></p>
    <component :is="as" :id="titleId" class="ds-section-title max-w-[640px] font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">{{ title }}</component>
    <p v-if="body" class="mt-4 max-w-[560px] text-input text-fg-muted">{{ body }}</p>
    <div v-if="$slots.action" class="mt-8"><slot name="action" /></div>
  </div>
</template>

<style>
.ds-section-title { line-height: 1.15; text-wrap: balance; }
</style>
