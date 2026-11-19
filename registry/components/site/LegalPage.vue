<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ButtonLink from '@/components/site/ButtonLink.vue'
import CallToAction from '@/components/site/CallToAction.vue'
import DocsBlocks, { type DocsBlock } from '@/components/site/DocsBlocks.vue'
import SitePage, { type SiteAction, type SiteAnnouncement, type SiteFooterData, type SiteHeaderData } from '@/components/site/SitePage.vue'
import SiteTag from '@/components/ui/SiteTag.vue'

// A page of policy text (Legal.vue: terms, privacy, disclosure): from 1024px, on the left in the double rule, the
// page's sections, held in view, the one being read on the paper with the red square; beside it the tag, the title,
// when it was last updated and the text (docs-blocks), each section with its id. Then the closing band, if any.
export type LegalSection = { id: string, label: string, blocks: DocsBlock[] }
const props = defineProps<{
  header: SiteHeaderData, footer: SiteFooterData, announcement?: SiteAnnouncement
  tag?: string
  title: string
  updated: string
  intro?: DocsBlock[]
  sections: LegalSection[]
  cta?: { title: string, action: SiteAction }
}>()

// The section being read: the last one whose top has passed a band under the header.
const active = ref(props.sections[0]?.id ?? '')
function track() {
  let on = props.sections[0]?.id ?? ''
  for (const s of props.sections) {
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top < 160) on = s.id
  }
  active.value = on
}
onMounted(() => {
  track()
  window.addEventListener('scroll', track, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', track))
</script>

<template>
  <SitePage data-ds="legal-page" :header="header" :footer="footer" :announcement="announcement">
      <template #logo><slot name="logo" /></template>
      <template #actions="{ place }"><slot name="actions" :place="place" /></template>
    <div class="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-14 pb-32 sm:px-6 lg:grid-cols-[224px_minmax(0,720px)] lg:gap-16 lg:px-10 lg:pt-20 lg:pb-40">
      <div role="navigation" aria-label="On this page" class="hidden lg:block">
        <div class="sticky top-28 border border-edge p-5 outline outline-offset-4 outline-edge">
          <p class="type-ui-strong text-fg">On this page</p>
          <ul class="-mx-2 mt-2 flex flex-col">
            <li v-for="s in sections" :key="s.id">
              <a :href="`#${s.id}`" :aria-current="s.id === active ? 'location' : undefined" class="ds-legal-side relative flex items-center py-1.5 ps-5 pe-2 type-ui" :class="s.id === active ? 'bg-surface-subtle text-fg' : 'text-fg-muted'">
                <span v-if="s.id === active" aria-hidden="true" class="absolute start-2 top-1/2 -mt-0.75 size-1.5 bg-home-red" />
                {{ s.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <article class="min-w-0">
        <p v-if="tag" class="mb-4 flex"><SiteTag>{{ tag }}</SiteTag></p>
        <h1 class="ds-legal-title font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">{{ title }}</h1>
        <p class="mt-3 text-body text-fg-faint">Last updated {{ updated }}</p>
        <div class="mt-12 flex flex-col gap-12">
          <DocsBlocks v-if="intro?.length" :blocks="intro" />
          <section v-for="s in sections" :id="s.id" :key="s.id" :aria-labelledby="`${s.id}-title`" class="scroll-mt-28">
            <h2 :id="`${s.id}-title`" class="text-docs-heading tracking-tight text-fg">{{ s.label }}</h2>
            <div class="mt-5"><DocsBlocks :blocks="s.blocks" /></div>
          </section>
        </div>
      </article>
    </div>
    <CallToAction v-if="cta" :title="cta.title">
      <ButtonLink :href="cta.action.href" variant="light" fill="black">{{ cta.action.label }}</ButtonLink>
    </CallToAction>
  </SitePage>
</template>

<style>
.ds-legal-title { line-height: 1.15; text-wrap: balance; }
.ds-legal-side { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-legal-side:hover { color: var(--ds-color-fg); } }
</style>
