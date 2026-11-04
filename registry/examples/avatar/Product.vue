<script setup lang="ts">
import { ChevronsUpDown } from 'lucide-vue-next'
import Avatar from '@/components/ui/Avatar.vue'
// The organization tile in the switcher, the account's black square at the sidebar's foot, and the three sizes.
const orgs = ['Acme', 'Acme Labs', 'Globex']
</script>

<template>
  <div class="flex flex-col gap-6">
    <ul class="flex w-full max-w-60 flex-col border border-edge p-1">
      <li v-for="o in orgs" :key="o" class="flex h-8 items-center gap-2 px-2 type-ui"><Avatar :name="o" />{{ o }}</li>
    </ul>
    <div class="flex h-10 w-full max-w-60 items-center gap-2 border border-edge px-2 type-ui">
      <Avatar variant="solid" />
      <span class="min-w-0 flex-1 truncate">team@acme.com</span>
      <ChevronsUpDown :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />
    </div>
    <div class="flex items-center gap-3">
      <Avatar name="Acme" :size="20" />
      <Avatar name="Acme" :size="28" />
      <Avatar name="Acme" :size="32" />
      <Avatar name="Acme" variant="solid" initial :size="32" />
    </div>
  </div>
</template>
