<script setup lang="ts">
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import DocsBlocks, { type DocsBlock } from '@/components/site/DocsBlocks.vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import Tag from '@/components/ui/Tag.vue'

// What changed, newest first: the head, then each release under a hairline, laid out as a policy page (Legal.vue): its
// date and version tag on the left, held in view from 1024px while its notes pass, the title and the notes
// (docs-blocks) in a 720px column beside it. Then the closing band.
export type ChangelogEntry = { id: string, date: string, version?: string, title: string, blocks: DocsBlock[] }
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  head: { tag?: string, title: string, body?: string }
  entries: ChangelogEntry[]
  cta: { title: string, action: SiteAction }
}>()
</script>

<template>
  <SitePage data-ds="changelog-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="changelog-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
      <SectionHead as="h1" title-id="changelog-page-title" :tag="head.tag" :title="head.title" :body="head.body" />
      <ol class="mx-auto mt-16 flex max-w-[1008px] flex-col gap-16">
        <li v-for="e in entries" :id="e.id" :key="e.id" class="grid scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-6 border-t border-edge pt-10 lg:grid-cols-[224px_minmax(0,720px)] lg:gap-16">
          <div class="flex items-center gap-3 self-start lg:sticky lg:top-28 lg:flex-col lg:items-start">
            <time class="type-ui text-fg-muted">{{ e.date }}</time>
            <Tag v-if="e.version">{{ e.version }}</Tag>
          </div>
          <div class="min-w-0">
            <h2 class="font-heading text-heading-2 font-normal tracking-tight text-fg">{{ e.title }}</h2>
            <div class="mt-6"><DocsBlocks :blocks="e.blocks" /></div>
          </div>
        </li>
      </ol>
    </section>
    <CallToAction :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>
