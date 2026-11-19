<script setup lang="ts">
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import Faq from '@/components/site/Faq.vue'
import FeatureGrid, { type Feature } from '@/components/site/FeatureGrid.vue'
import Hero from '@/components/site/Hero.vue'
import LogoStrip, { type Logo } from '@/components/site/LogoStrip.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import Testimonial from '@/components/site/Testimonial.vue'

// The website's home (pages/index.vue), in its order: the hero with the one dark call to action and the window in the
// red frame (the `window` slot), who connects (logo-strip), what it does (feature-grid), one customer's words
// (testimonial), the questions (faq) and the closing red band (call-to-action), in the site's frame (site-page).
defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  hero: { eyebrow?: string, title: string, body?: string, action: SiteAction }
  logos: { title: string, tag?: string, logos: Logo[] }
  features: { title: string, tag?: string, body?: string, features: Feature[] }
  testimonial: { quote: string, role: string, company: string }
  faq: { q: string, a: string }[]
  cta: { title: string, action: SiteAction }
}>()
</script>

<template>
  <SitePage data-ds="home-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <Hero :eyebrow="hero.eyebrow" :title="hero.title" :body="hero.body">
      <template #action><ButtonLink :href="hero.action.href" grain pixels arrow>{{ hero.action.label }}</ButtonLink></template>
      <template #window><slot name="window" /></template>
    </Hero>
    <LogoStrip v-bind="logos" />
    <FeatureGrid v-bind="features" />
    <Testimonial v-bind="testimonial" />
    <Faq :items="faq" />
    <CallToAction :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>
