<script setup lang="ts">
import SectionHead from '@/components/site/SectionHead.vue'
import ButtonLink from '@/components/site/ButtonLink.vue'
// A page's own head: the tag, the line, one muted line and the one dark call to action.
</script>

<template>
  <SectionHead
    as="h1"
    tag="Pricing"
    title="Pay for what you use."
    body="Usage pricing for every layer, with no monthly minimum."
  >
    <template #action><ButtonLink href="#demo" grain pixels arrow>Book a demo</ButtonLink></template>
  </SectionHead>
</template>
