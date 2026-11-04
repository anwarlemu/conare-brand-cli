<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceSwitcher, { type WorkspaceGroup } from '@/components/product/WorkspaceSwitcher.vue'
// The switcher at the top of the sidebar, with sample organizations. Its row has its four edges here, where no
// sidebar frames it. Picking one switches the sample; wire `update:modelValue` to your own switch.
const groups: WorkspaceGroup[] = [
  { id: 'acme', name: 'Acme', role: 'admin', organizations: [{ id: 'prod', name: 'Acme production', default: true }, { id: 'staging', name: 'Acme staging' }] },
  { id: 'acme-labs', name: 'Acme labs', role: 'member', organizations: [{ id: 'research', name: 'Acme research' }] },
]
const current = ref('prod')
</script>

<template>
  <div class="h-96">
    <div class="h-bar w-sidebar border border-edge bg-surface-subtle">
      <WorkspaceSwitcher v-model="current" :groups="groups" admin>
        <template #mark><img src="/conare-ds/logo/svg/mark.svg" alt="" height="20" class="h-5 w-auto shrink-0"></template>
      </WorkspaceSwitcher>
    </div>
  </div>
</template>
