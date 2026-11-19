<script setup lang="ts">
import SectionHead from '@/components/site/SectionHead.vue'

// One group of prices (pricing.vue): its case on the left, its cards on the right in the website's double rule, side by
// side from 1024px. Each card: the name in Faculty Glyphic 20px, the price large in tabular figures with its unit, one
// line, and what it includes under a hairline, each led by the red square. Two across from 640px; an odd last card
// takes the row.
export type PriceCard = { name: string, amount: string, unit?: string, line?: string, facts?: string[] }
withDefaults(defineProps<{ title: string, body?: string, cards: PriceCard[], titleId?: string }>(), { titleId: 'pricing-title' })
</script>

<template>
  <section data-ds="pricing-table" :aria-labelledby="titleId" class="mx-auto grid max-w-[1440px] scroll-mt-16 grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16 lg:px-10 lg:pb-32">
    <SectionHead :title="title" :body="body" :title-id="titleId" align="start" />
    <ul class="grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-2">
      <li v-for="(c, i) in cards" :key="c.name" class="flex flex-col bg-surface px-5 py-6 sm:px-6" :class="cards.length % 2 && i === cards.length - 1 ? 'sm:col-span-2' : ''">
        <h3 class="type-heading-3 text-fg">{{ c.name }}</h3>
        <p class="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span class="text-viz-score tracking-display text-fg tabular-nums">{{ c.amount }}</span>
          <span v-if="c.unit" class="text-body text-fg-muted">{{ c.unit }}</span>
        </p>
        <p v-if="c.line" class="mt-3 text-body leading-5.5 text-fg-muted">{{ c.line }}</p>
        <ul v-if="c.facts?.length" class="mt-5 flex flex-col gap-2 border-t border-edge pt-5">
          <li v-for="f in c.facts" :key="f" class="flex items-center gap-3 text-body text-fg">
            <span aria-hidden="true" class="size-1.5 shrink-0 bg-home-red" />
            {{ f }}
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
