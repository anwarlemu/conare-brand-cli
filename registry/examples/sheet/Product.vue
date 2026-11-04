<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import CodeBlock from '@/components/ui/CodeBlock.vue'
import Sheet from '@/components/ui/Sheet.vue'
// The docs beside the console: a page's help opens in a sheet at the right edge, with the call to make. Escape or the
// dimmed page closes it.
const open = ref(false)
const code = `curl https://api.acme.dev/v1/namespaces/contracts/query \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{ "query": "notice period", "top_k": 5 }'`
</script>

<template>
  <div class="flex min-h-40 items-center justify-center">
    <Button @click="open = true"><BookOpen :size="12" :stroke-width="1.5" aria-hidden="true" />Docs</Button>
    <Sheet v-model:open="open" title="Search a namespace" description="Send a question and get back the passages that answer it, best first.">
      <div class="flex flex-col gap-4">
        <p class="type-ui text-fg-soft">Name the namespace in the path. <span class="type-code-sm text-fg">top_k</span> sets how many passages come back, 5 by default.</p>
        <CodeBlock :code="code" label="Request" />
        <h3 class="type-heading-4">What comes back</h3>
        <p class="type-ui text-fg-soft">Each passage has its document's ID, the text and a score between 0 and 1. Results under 0.3 are left out.</p>
      </div>
    </Sheet>
  </div>
</template>
