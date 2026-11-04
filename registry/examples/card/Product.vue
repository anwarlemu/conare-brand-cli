<script setup lang="ts">
import { Cable, Code } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Door from '@/components/ui/Door.vue'
// A card with its head and body, the framed card a page leads with, and doors: whole cards that open something.
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <Card title="Credits">
      <template #actions><a href="#" class="hover:text-fg">Billing</a></template>
      <div class="flex flex-col gap-2">
        <p><span class="type-heading-3">$268.73</span> <span class="type-meta text-fg-muted">left of $310.00</span></p>
        <div class="h-1 bg-edge" role="meter" aria-label="credits left" aria-valuemin="0" aria-valuemax="310" aria-valuenow="268.73"><span class="block h-full w-[87%] bg-surface-inverse" /></div>
      </div>
    </Card>
    <Card framed><p class="type-ui">The website's double rule, for the one block a page leads with.</p></Card>
    <Door title="Connect an app" description="Slack, Notion, Gmail and 11 more." :icon="Cable" />
    <Door title="Send by API" description="Write documents from your code." :icon="Code" arrow />
  </div>
</template>
