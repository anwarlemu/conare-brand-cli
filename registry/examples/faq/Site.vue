<script setup lang="ts">
import Faq from '@/components/site/Faq.vue'
// The questions a buyer asks before booking a demo. Wide: pick a question and its answer shows beside the list.
// Phone: each opens under its question.
const items = [
  { q: 'How do I get started?', a: 'Conare is invite-only for now. Book a demo: we set up your organization with you, and your team then creates API keys in the console.' },
  { q: 'Which part should I use?', a: 'The platform when you want Conare to hold your data, keep it in sync and return the right context. The models or the vector database alone when you already run the rest of the stack.' },
  { q: 'Is my data used to train models?', a: 'No. We do not train models on your content, unless your organization asks us in writing for a custom model built from it, which then serves your organization alone.' },
  { q: 'What happens when a record changes?', a: 'A changed record replaces its old version. A deleted one is deleted.' },
  { q: 'How do I delete a user\'s data?', a: 'One call removes everything Conare holds of them.' },
  { q: 'What do I have to run?', a: 'Nothing. Conare runs the servers, shards and index tuning, the embedding and reranking models, and the sync jobs for every app, and keeps each organization\'s data separate.' },
]
</script>

<template>
  <Faq :items="items" />
</template>
