<script setup lang="ts">
import Door from '@/components/ui/Door.vue'
import { grouped, items } from '~/utils/registry'
// Every item, by group, each a way in.
useHead({ title: 'All components | Conare design system' })
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="mx-auto flex w-full max-w-page-wide flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="All components" :description="`${items.length} parts of the Conare console and website, each built from conare.ai's own code and rendered here from the files apps install.`" />
    <section v-for="g in grouped()" :key="g.id" class="flex flex-col gap-4" :aria-labelledby="`group-${g.id}`">
      <SectionHead :id="`group-${g.id}`" :title="g.label" />
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Door v-for="i in g.items" :key="i.name" :title="i.title" :href="`/components/${i.name}`" arrow>{{ i.description }}</Door>
      </div>
    </section>
  </div>
</template>
