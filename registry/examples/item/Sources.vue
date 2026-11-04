<script setup lang="ts">
import { FileText, Hash, Users } from 'lucide-vue-next'
import Item from '@/components/ui/Item.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
// Sources as getting started lists them (source-row): the app's mark and the source's name, its sync's state, then
// when it last synced and syncs next. Each row opens its source.
const sources = [
  { id: 'drive', name: 'Contracts drive', icon: FileText, status: 'ready', last: 'synced 2 min ago', next: 'next in 58 min' },
  { id: 'slack', name: 'Acme Slack', icon: Hash, status: 'syncing', last: 'synced 1 h ago', next: '' },
  { id: 'crm', name: 'Accounts', icon: Users, status: 'error', last: 'synced yesterday', next: '' },
]
</script>

<template>
  <ul class="flex max-w-140 flex-col gap-3">
    <li v-for="s in sources" :key="s.id" class="border border-edge px-4">
      <Item :href="`#${s.id}`" :title="s.name" :description="[s.last, s.next].filter(Boolean).join(' · ')" arrow>
        <template #media><span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface-subtle" aria-hidden="true"><component :is="s.icon" :size="12" :stroke-width="1.5" /></span></template>
        <template #meta><StatusTag :status="s.status" /></template>
      </Item>
    </li>
  </ul>
</template>
