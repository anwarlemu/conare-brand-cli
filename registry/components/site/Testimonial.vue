<script setup lang="ts">
import Avatar from '@/components/ui/Avatar.vue'
import SiteTag from '@/components/ui/SiteTag.vue'

// One customer's words, in the website's double rule (the FAQ's frame): the tag, the quote in Faculty Glyphic 24px
// (32px from 640px) on 1.2 lines, balanced and centred in 880px, then who said it: the company's square initial, the
// role in ink and the company muted. Attribute a quote to a role, never invent a person.
withDefaults(defineProps<{ quote: string, role: string, company: string, tag?: string }>(), { tag: 'Customers' })
</script>

<template>
  <section data-ds="testimonial" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
    <figure class="mx-auto flex max-w-[1200px] flex-col items-center border border-edge px-5 py-14 text-center outline outline-offset-4 outline-edge sm:px-10 sm:py-20">
      <p class="mb-8 flex"><SiteTag>{{ tag }}</SiteTag></p>
      <blockquote class="ds-quote max-w-[880px] font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">{{ quote }}</blockquote>
      <figcaption class="mt-10 flex items-center gap-3 text-left">
        <Avatar :name="company" variant="solid" initial :size="32" />
        <span class="flex flex-col">
          <span class="type-body text-fg">{{ role }}</span>
          <span class="type-meta text-fg-muted">{{ company }}</span>
        </span>
      </figcaption>
    </figure>
  </section>
</template>

<style>
.ds-quote { line-height: 1.2; text-wrap: balance; }
</style>
