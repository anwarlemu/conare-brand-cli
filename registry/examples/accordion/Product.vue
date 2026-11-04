<script setup lang="ts">
import { ref } from 'vue'
import Accordion from '@/components/ui/Accordion.vue'
import AccordionItem from '@/components/ui/AccordionItem.vue'
// Details most readers skip, one press away: one open at a time, a second press closes it.
const open = ref<string | string[] | null>('retention')
</script>

<template>
  <div class="max-w-[560px]">
    <Accordion v-model="open">
      <AccordionItem value="retention" title="How long are deleted documents kept?">Deleted documents leave search at once and are removed from storage within 30 days.</AccordionItem>
      <AccordionItem value="limits" title="What are the limits on a namespace?">A namespace holds up to 50 million documents. Ask for more and we raise it.</AccordionItem>
      <AccordionItem value="regions" title="Which regions can a namespace live in?">The United States by default; the EU region on request, set when the namespace is created.</AccordionItem>
    </Accordion>
  </div>
</template>
