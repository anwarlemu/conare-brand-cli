<script setup lang="ts">
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import Faq from '@/components/site/Faq.vue'
import PricingTable, { type PriceCard } from '@/components/site/PricingTable.vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import Grain from '@/components/visuals/Grain.vue'
import RoomGrid from '@/components/visuals/RoomGrid.vue'

// Pricing (pages/pricing.vue): the head with the one dark call to action, then each group of prices (pricing-table),
// then Enterprise, the page's one red block (the hero's frame: the grain and the room grid), what its terms cover as
// off-white cards in the double rule with the light button, its squares coming in black; then the questions and the
// closing band.
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  head: { tag?: string, title: string, body?: string, action: SiteAction }
  groups: { key: string, title: string, body?: string, cards: PriceCard[] }[]
  enterprise?: { title: string, body: string, action: SiteAction, items: { name: string, line: string }[] }
  faq: { q: string, a: string }[]
  cta: { title: string, action: SiteAction }
}>()
</script>

<template>
  <SitePage data-ds="pricing-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="pricing-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28">
      <SectionHead as="h1" title-id="pricing-page-title" :tag="head.tag" :title="head.title" :body="head.body">
        <template #action><ButtonLink :href="head.action.href" grain pixels arrow>{{ head.action.label }}</ButtonLink></template>
      </SectionHead>
    </section>
    <PricingTable v-for="g in groups" :id="g.key" :key="g.key" :title-id="`pricing-${g.key}`" :title="g.title" :body="g.body" :cards="g.cards" />
    <section v-if="enterprise" aria-labelledby="pricing-enterprise" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <div class="relative overflow-hidden bg-home-red px-4 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <Grain />
        <RoomGrid />
        <!-- Click-through but for the button and the cards, so the room's tiles light under the pointer around them. -->
        <div class="pointer-events-none relative grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16">
          <div class="flex flex-col items-start">
            <h2 id="pricing-enterprise" class="ds-enterprise-title font-heading text-heading-2 font-normal tracking-tight text-off-white sm:text-heading-1">{{ enterprise.title }}</h2>
            <p class="mt-4 max-w-[360px] text-input text-off-white/80">{{ enterprise.body }}</p>
            <div class="pointer-events-auto mt-8"><ButtonLink :href="enterprise.action.href" variant="light" fill="black">{{ enterprise.action.label }}</ButtonLink></div>
          </div>
          <ul class="pointer-events-auto grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-off-white/40 sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="e in enterprise.items" :key="e.name" class="flex flex-col bg-surface px-5 py-6 sm:px-6">
              <span aria-hidden="true" class="size-1.5 shrink-0 bg-home-red" />
              <p class="mt-5 type-heading-3 text-fg">{{ e.name }}</p>
              <p class="mt-2 text-body leading-5.5 text-fg-muted">{{ e.line }}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <Faq :items="faq" />
    <CallToAction :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>

<style>
.ds-enterprise-title { line-height: 1.15; text-wrap: balance; }
</style>
