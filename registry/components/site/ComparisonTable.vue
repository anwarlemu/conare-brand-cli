<script setup lang="ts">
import SectionHead from '@/components/site/SectionHead.vue'

// What each plan includes, side by side: the band's head, then a table in the website's double rule. A row per thing;
// a column per plan, its name in Faculty Glyphic. A cell is the brand's red square (included), a short hairline (not
// included, said aloud for screen readers) or a few words. It scrolls sideways on phones and fades at its edges. The
// site has no comparison table: set from the pricing cards' rule, type and red square.
export type ComparisonRow = { feature: string, values: (boolean | string)[] }
withDefaults(defineProps<{ title: string, tag?: string, body?: string, plans: string[], rows: ComparisonRow[], titleId?: string, included?: string, excluded?: string }>(), { titleId: 'comparison-title', included: 'Included', excluded: 'Not included' })
</script>

<template>
  <section data-ds="comparison-table" :aria-labelledby="titleId" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
    <SectionHead :title="title" :tag="tag" :body="body" :title-id="titleId" />
    <div class="mt-10 border border-edge outline outline-offset-4 outline-edge">
      <div class="fade-x overflow-x-auto" tabindex="0" role="region" :aria-labelledby="titleId">
        <table class="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" class="w-2/5 px-5 py-4 type-meta font-normal text-fg-muted"><span class="sr-only">Feature</span></th>
              <th v-for="p in plans" :key="p" scope="col" class="px-5 py-4 type-heading-3 font-normal text-fg">{{ p }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.feature" class="border-t border-edge">
              <th scope="row" class="px-5 py-4 text-body font-normal text-fg">{{ r.feature }}</th>
              <td v-for="(v, i) in r.values" :key="i" class="px-5 py-4 text-body text-fg">
                <template v-if="v === true"><span aria-hidden="true" class="inline-block size-2 bg-home-red" /><span class="sr-only">{{ included }}</span></template>
                <template v-else-if="v === false"><span aria-hidden="true" class="inline-block h-px w-3 bg-edge-strong align-middle" /><span class="sr-only">{{ excluded }}</span></template>
                <template v-else>{{ v }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
