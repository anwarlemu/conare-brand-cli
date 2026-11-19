<script setup lang="ts">
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import DocsBlocks, { type DocsBlock } from '@/components/site/DocsBlocks.vue'
import FeatureGrid, { type Feature } from '@/components/site/FeatureGrid.vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'

// About the company: the head, the story in one narrow column (docs-blocks, as a blog post's text), the numbers in the
// double rule (each large in tabular figures over its label, as a price), what the team holds to (feature-grid) and the
// closing band, in the site's frame.
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  head: { tag?: string, title: string, body?: string }
  story: DocsBlock[]
  numbers: { value: string, label: string }[]
  values: { title: string, tag?: string, body?: string, features: Feature[] }
  cta: { title: string, action: SiteAction }
}>()
</script>

<template>
  <SitePage data-ds="about-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="about-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-16 sm:px-6 lg:px-10 lg:pt-20 lg:pb-20">
      <SectionHead as="h1" title-id="about-page-title" :tag="head.tag" :title="head.title" :body="head.body" />
      <div class="mx-auto mt-12 max-w-[640px]"><DocsBlocks :blocks="story" /></div>
    </section>
    <section aria-label="In numbers" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <dl class="grid grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge lg:grid-cols-4">
        <div v-for="n in numbers" :key="n.label" class="flex flex-col-reverse gap-2 bg-surface px-5 py-6 sm:px-6">
          <dt class="text-body text-fg-muted">{{ n.label }}</dt>
          <dd class="text-viz-score tracking-display text-fg tabular-nums">{{ n.value }}</dd>
        </div>
      </dl>
    </section>
    <FeatureGrid v-bind="values" />
    <CallToAction :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>
