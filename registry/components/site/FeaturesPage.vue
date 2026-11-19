<script setup lang="ts">
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import FeatureGrid, { type Feature } from '@/components/site/FeatureGrid.vue'
import LogoStrip, { type Logo } from '@/components/site/LogoStrip.vue'
import SectionHead from '@/components/site/SectionHead.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import Testimonial from '@/components/site/Testimonial.vue'

// A product's page: the head with the one dark call to action, what it does (feature-grid), what it connects to
// (logo-strip), one customer's words (testimonial) and the closing band, in the site's frame.
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  head: { tag?: string, title: string, body?: string, action: SiteAction }
  features: { title: string, tag?: string, body?: string, features: Feature[] }
  logos: { title: string, tag?: string, logos: Logo[] }
  testimonial: { quote: string, role: string, company: string }
  cta: { title: string, action: SiteAction }
}>()
</script>

<template>
  <SitePage data-ds="features-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <section aria-labelledby="features-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28">
      <SectionHead as="h1" title-id="features-page-title" :tag="head.tag" :title="head.title" :body="head.body">
        <template #action><ButtonLink :href="head.action.href" grain pixels arrow>{{ head.action.label }}</ButtonLink></template>
      </SectionHead>
    </section>
    <FeatureGrid v-bind="features" />
    <LogoStrip v-bind="logos" />
    <Testimonial v-bind="testimonial" />
    <CallToAction :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>
