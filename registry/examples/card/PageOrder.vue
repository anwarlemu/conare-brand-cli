<script setup lang="ts">
import { Cable, Code } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Door from '@/components/ui/Door.vue'
// The cards in the order a page uses them: the one block it leads with, the subjects under it, the ways in at the foot.
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">Leads the page</p>
    <Card framed><p class="type-ui">Conare reached the right page on 94 of 100 questions.</p></Card>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">One subject each</p>
    <div class="grid gap-4 sm:grid-cols-2">
      <Card title="Credits">
        <template #actions><a href="#" class="hover:text-fg">Billing</a></template>
        <div class="flex flex-col gap-2">
          <p><span class="type-heading-3">$268.73</span> <span class="type-meta text-fg-muted">left of $310.00</span></p>
          <div class="h-1 bg-edge" role="meter" aria-label="credits left" aria-valuemin="0" aria-valuemax="310" aria-valuenow="268.73"><span class="block h-full w-[87%] bg-surface-inverse" /></div>
        </div>
      </Card>
      <Card title="Queries">
        <template #actions><a href="#" class="hover:text-fg">Usage</a></template>
        <div class="flex flex-col gap-2">
          <p><span class="type-heading-3">186,402</span> <span class="type-meta text-fg-muted">this month</span></p>
          <div class="h-1 bg-edge" role="meter" aria-label="queries used" aria-valuemin="0" aria-valuemax="300000" aria-valuenow="186402"><span class="block h-full w-[62%] bg-surface-inverse" /></div>
        </div>
      </Card>
    </div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Ways in</p>
    <div class="grid gap-4 sm:grid-cols-2">
      <Door title="Connect an app" description="Slack, Notion, Gmail and 11 more." :icon="Cable" />
      <Door title="Send by API" description="Write documents from your code." :icon="Code" arrow />
    </div>
  </div>
</template>
