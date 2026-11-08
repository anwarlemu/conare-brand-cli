<script setup lang="ts">
import CellBurst from '@/components/visuals/CellBurst.vue'
import Grain from '@/components/visuals/Grain.vue'

// The band before the website's footer (Cta.vue): the closing line and one action, centred on the red under the grain
// and a jumbled sheet of cells whose grid keeps redrawing itself (CellBurst jumble strong trace). A triple rule, the
// FAQ's width: the panel's border, an outline 4px out, and the frame's border 4px beyond that. Put the one action in
// the default slot: a light button-link with fill="black", so its squares come in black on the red.
withDefaults(defineProps<{ title: string, seed?: number, titleId?: string }>(), { seed: 53, titleId: 'cta-title' })
</script>

<template>
  <section data-ds="call-to-action" :aria-labelledby="titleId" class="mx-auto max-w-[1440px] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-40">
    <div class="mx-auto max-w-[1220px] border border-edge p-2.25">
      <div class="relative overflow-hidden border border-edge bg-home-red outline outline-offset-4 outline-edge">
        <Grain />
        <CellBurst :seed="seed" jumble strong trace />
        <div class="relative flex flex-col items-center px-4 py-24 text-center sm:py-32">
          <h2 :id="titleId" class="ds-cta-title font-heading text-heading-1 font-normal tracking-display text-off-white sm:text-display">{{ title }}</h2>
          <div v-if="$slots.default" class="mt-8"><slot /></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.ds-cta-title { line-height: 1.1; text-wrap: balance; }
</style>
