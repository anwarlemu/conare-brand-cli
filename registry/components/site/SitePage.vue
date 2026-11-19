<script setup lang="ts">
import AnnouncementBar from '@/components/site/AnnouncementBar.vue'
import SiteFooter, { type FooterLink } from '@/components/site/SiteFooter.vue'
import SiteHeader, { type SiteLink } from '@/components/site/SiteHeader.vue'
import type { ProductMenuItem } from '@/components/site/ProductMenu.vue'

// Every website page's frame (pages/index.vue, pricing.vue, blog): the announcement bar if there is one, the header,
// then the page in <main> on its own off-white ground above the footer, which waits pinned under it from 768px and is
// uncovered as the page scrolls off it. `header` is SiteHeader's props, `footer` SiteFooter's and `announcement`
// AnnouncementBar's; the `logo` and `actions` slots go to the header (`actions` renders for the bar and the sheet).
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/** A page's call to action: its words and where it goes. */
export type SiteAction = { label: string, href: string }
defineProps<{ header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement }>()
</script>

<template>
  <div data-ds="site-page" class="relative bg-surface text-fg">
    <AnnouncementBar v-if="announcement" v-bind="announcement" />
    <SiteHeader v-bind="header">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    </SiteHeader>
    <main class="relative z-10 bg-surface"><slot /></main>
    <SiteFooter v-bind="footer" pinned />
  </div>
</template>
