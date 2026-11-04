<script setup lang="ts">
import PromptBar from '@/components/site/PromptBar.vue'
import type { PromptTemplate } from '@/components/site/PromptBar.vue'
// Docked from the start with its shortcut, as the docs have it: focus it (or press Cmd+K) for the templates, and pick a
// question to see the bar grow into a thread. The answers are sample text.
const templates: PromptTemplate[] = [
  { label: 'Book a demo', icon: 'phone', href: '#demo' },
  { label: 'Which part should I use?', icon: 'dots', answer: 'Start with Search: store your documents in a namespace and query it. Add Sync to keep your apps in it, and Parse for files.', more: '#search' },
  { label: 'Is my data used to train models?', icon: 'hatch', answer: 'No. Your documents are stored for your searches only and are never used to train models.', more: '#security' },
  { label: 'What do I have to run?', icon: 'checker', answer: 'Nothing. Call the API with your key, for example `POST /v1/search`, or connect an agent over MCP.', more: '#quickstart' },
]
</script>

<template>
  <div class="relative min-h-[360px]">
    <PromptBar :templates="templates" href="#demo" label="Message Acme" docked shortcuts :voice="false" />
  </div>
</template>
