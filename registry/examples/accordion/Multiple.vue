<script setup lang="ts">
import { ref } from 'vue'
import Accordion from '@/components/ui/Accordion.vue'
import AccordionItem from '@/components/ui/AccordionItem.vue'
// Several open at once, for a checklist the person works down.
const open = ref<string | string[] | null>(['keys'])
</script>

<template>
  <div class="max-w-[560px]">
    <Accordion v-model="open" multiple>
      <AccordionItem value="keys" title="Create an API key">Settings, then API keys. Copy it once: it is not shown again.</AccordionItem>
      <AccordionItem value="source" title="Connect a source">Pick an app and sign in. Its documents start syncing into a namespace.</AccordionItem>
      <AccordionItem value="search" title="Run a search">Ask a question in plain words. The best match comes first, with its source.</AccordionItem>
    </Accordion>
  </div>
</template>
