<script setup lang="ts">
import ScrollArea from '@/components/ui/ScrollArea.vue'
// A long list of documents in a short box, and a wide row of tags that scrolls sideways on its own.
const docs = Array.from({ length: 24 }, (_, i) => ({ id: `acme-contract-${String(i + 1).padStart(3, '0')}.pdf`, pages: 4 + ((i * 7) % 30) }))
const tags = ['contracts', 'support', 'crm', 'slack', 'drive', 'notion', 'gmail', 'billing', 'sales-calls', 'legal', 'hr', 'engineering']
</script>

<template>
  <div class="flex flex-col gap-6">
    <ScrollArea label="documents" max-height="240px" class="w-full max-w-sm border border-edge">
      <ul>
        <li v-for="d in docs" :key="d.id" class="flex h-10 items-center justify-between gap-4 border-b border-edge px-3 last:border-b-0">
          <span class="truncate type-code-sm">{{ d.id }}</span>
          <span class="type-meta text-fg-muted tabular-nums">{{ d.pages }} pages</span>
        </li>
      </ul>
    </ScrollArea>
    <ScrollArea label="namespaces" axis="x" class="w-full max-w-sm border border-edge">
      <div class="flex w-max gap-2 p-3">
        <span v-for="t in tags" :key="t" class="border border-edge px-2 type-code-sm leading-6">{{ t }}</span>
      </div>
    </ScrollArea>
  </div>
</template>
