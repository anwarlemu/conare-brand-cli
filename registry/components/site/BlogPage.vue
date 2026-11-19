<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import BlogCard from '@/components/site/BlogCard.vue'
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import Input from '@/components/ui/Input.vue'

// The blog (pages/blog/index.vue): the head, the categories with a search beside them, then the posts three across
// (blog-card), every card in a row one height; nothing matching says so under a hairline. The picked category rests on
// the paper with its red square, the others muted until the pointer reaches them. Then the closing band.
export type BlogPost = { href: string, title: string, dek?: string, category: string, author?: string, date?: string }
const props = defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  head: { tag?: string, title: string }
  categories: string[]
  posts: BlogPost[]
  cta: { title: string, action: SiteAction }
}>()
const category = ref('All')
const query = ref('')
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.posts.filter(p => (category.value === 'All' || p.category === category.value) && (!q || `${p.title} ${p.dek ?? ''}`.toLowerCase().includes(q)))
})
</script>

<template>
  <SitePage data-ds="blog-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="blog-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
      <SectionHead as="h1" title-id="blog-page-title" :tag="head.tag" :title="head.title" />
      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Categories" class="flex flex-wrap gap-1 text-body leading-none">
          <button
            v-for="c in ['All', ...categories]"
            :key="c"
            type="button"
            :aria-pressed="category === c"
            class="ds-blog-cat flex h-7.5 cursor-pointer items-center gap-2 px-3"
            :class="category === c ? 'bg-surface-subtle text-fg' : 'text-fg-muted'"
            @click="category = c"
          >
            <span v-if="category === c" aria-hidden="true" class="size-1.5 bg-home-red" />
            {{ c }}
          </button>
        </div>
        <div class="w-full sm:w-70">
          <Input v-model="query" :icon="Search" type="search" enterkeyhint="search" placeholder="Search" aria-label="Search the blog" @keydown.esc="query = ''" />
        </div>
      </div>
      <ul v-if="shown.length" class="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="p in shown" :key="p.href" class="flex"><BlogCard v-bind="p" /></li>
      </ul>
      <p v-else class="mt-12 border-t border-edge pt-6 text-body text-fg-muted">{{ query ? `Nothing matches "${query}".` : `Nothing in ${category} yet.` }}</p>
    </section>
    <CallToAction :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>

<style>
.ds-blog-cat { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-blog-cat:hover { color: var(--ds-color-fg); } }
.ds-blog-cat:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
</style>
