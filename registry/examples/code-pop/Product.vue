<script setup lang="ts">
import CodePop from '@/components/ui/CodePop.vue'
// Closed, as a search's results end: press Show code and the request takes its own line under the row.
const code = `curl https://api.conare.ai/v1/namespaces/contracts/query \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -d '{ "query": "notice period to terminate a contract", "top_k": 5 }'`
</script>

<template>
  <div class="flex min-h-85 max-w-180 flex-col justify-end gap-3">
    <p class="type-meta text-fg-muted tabular-nums"><span class="text-fg-accent">5</span> of 2,811,549 documents</p>
    <div class="flex flex-wrap items-center gap-1.5 border-t border-edge pt-3">
      <span class="inline-flex items-center bg-surface-subtle px-2 py-1 text-meta text-fg-soft tabular-nums">Done 4:34 PM</span>
      <span class="inline-flex items-center bg-surface-subtle px-2 py-1 text-meta text-fg-soft tabular-nums">257 ms</span>
      <CodePop :code="code" />
    </div>
  </div>
</template>
