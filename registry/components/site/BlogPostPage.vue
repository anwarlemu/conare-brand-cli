<script setup lang="ts">
import BlogCard from '@/components/site/BlogCard.vue'
import ButtonLink from '@/components/site/ButtonLink.vue'
import DocsBlocks, { type DocsBlock } from '@/components/site/DocsBlocks.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import CellBurst from '@/components/visuals/CellBurst.vue'
import Grain from '@/components/visuals/Grain.vue'
import type { BlogPost } from '@/components/site/BlogPage.vue'

// A blog post (pages/blog/[slug].vue): the trail and the title centred, a wide dark panel as the picture (the grain
// and a jumbled sheet of cells in the double rule), who it is from and when, the text in one narrow column
// (docs-blocks), a quiet link on, then more posts from the category (blog-card) under a hairline.
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  post: { title: string, category: string, author?: string, date?: string, blocks: DocsBlock[], seed?: number }
  blogHref: string
  link?: SiteAction
  more?: BlogPost[]
}>()
</script>

<template>
  <SitePage data-ds="blog-post-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <article class="mx-auto max-w-[1440px] px-4 pt-14 pb-24 sm:px-6 lg:px-10 lg:pt-20">
      <header class="flex flex-col items-center text-center">
        <p class="flex items-center gap-2 type-ui text-fg-faint">
          <a :href="blogHref" class="ds-post-trail">Blog</a>
          <span aria-hidden="true">/</span>
          <span>{{ post.category }}</span>
        </p>
        <h1 class="ds-post-title mt-4 max-w-[760px] font-heading text-docs-heading font-normal tracking-tight text-fg sm:text-hero">{{ post.title }}</h1>
      </header>
      <div aria-hidden="true" class="relative mx-auto mt-12 aspect-[4/3] max-w-[960px] overflow-hidden border border-edge bg-ds-neutral-200 text-ds-neutral-300 outline outline-offset-4 outline-edge sm:aspect-[2/1]">
        <Grain />
        <span class="pointer-events-none absolute inset-0 opacity-70"><CellBurst :seed="post.seed ?? 31 + post.title.length * 17" jumble /></span>
      </div>
      <p v-if="post.author || post.date" class="mt-10 text-center type-ui text-fg-faint">{{ [post.author, post.date].filter(Boolean).join(' · ') }}</p>
      <div class="mx-auto mt-10 max-w-[640px]">
        <DocsBlocks :blocks="post.blocks" />
        <div v-if="link" class="mt-12 flex justify-start"><ButtonLink :href="link.href" variant="secondary" size="sm">{{ link.label }}</ButtonLink></div>
      </div>
    </article>
    <section v-if="more?.length" aria-labelledby="blog-more-title" class="mx-auto max-w-[1440px] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-40">
      <div class="flex items-end justify-between gap-6 border-t border-edge pt-10">
        <h2 id="blog-more-title" class="font-heading text-heading-2 font-normal tracking-tight text-fg">More {{ post.category.toLowerCase() }}</h2>
        <a :href="blogHref" class="ds-post-trail text-body text-fg-faint">All posts</a>
      </div>
      <ul class="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="p in more" :key="p.href" class="flex"><BlogCard v-bind="p" /></li>
      </ul>
    </section>
  </SitePage>
</template>

<style>
.ds-post-title { line-height: 1.15; text-wrap: balance; }
.ds-post-trail { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-post-trail:hover { color: var(--ds-color-fg); } }
</style>
