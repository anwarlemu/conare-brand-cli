<script setup lang="ts">
import ButtonLink from '@/components/site/ButtonLink.vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'

// The page for an address that leads nowhere: the tag with the code, one line on what happened, the one dark way home,
// then where people usually meant to go, as cells in the double rule that take the paper under the pointer. In the
// site's frame, so the header and the footer still lead on.
withDefaults(defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  code?: string
  title?: string
  body?: string
  home: SiteAction
  links?: SiteAction[]
}>(), { code: '404', title: 'This page is not here.', body: 'It moved, or the address has a typo. Start again from the home page.', links: () => [] })
</script>

<template>
  <SitePage data-ds="not-found-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="not-found-title" class="mx-auto max-w-[1440px] px-4 pt-24 pb-32 sm:px-6 lg:px-10 lg:pt-32 lg:pb-40">
      <SectionHead as="h1" title-id="not-found-title" :tag="code" :title="title" :body="body">
        <template #action><ButtonLink :href="home.href" grain pixels arrow>{{ home.label }}</ButtonLink></template>
      </SectionHead>
      <ul v-if="links.length" aria-label="Pages people look for" class="mx-auto mt-16 grid max-w-[880px] grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-4">
        <li v-for="l in links" :key="l.href" class="flex bg-surface">
          <a :href="l.href" class="ds-lost-link flex h-16 w-full items-center justify-center px-3 text-body text-fg">{{ l.label }}</a>
        </li>
      </ul>
    </section>
  </SitePage>
</template>

<style>
.ds-lost-link { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-lost-link:hover { background-color: var(--ds-color-surface-subtle); } }
.ds-lost-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
</style>
