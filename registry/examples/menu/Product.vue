<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Check, ChevronsUpDown, Plus, Settings, Users } from 'lucide-vue-next'
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
import MenuLabel from '@/components/ui/MenuLabel.vue'
import MenuSeparator from '@/components/ui/MenuSeparator.vue'
// The sidebar's organization switcher, open to show its rows: the organizations under their customer, the current one
// checked, then what goes with an organization. Sample data; wire `select` to your own switch.
const organizations = [
  { id: 'prod', name: 'Acme production', default: true },
  { id: 'staging', name: 'Acme staging' },
  { id: 'research', name: 'Acme research' },
]
const current = ref('prod')
const org = computed(() => organizations.find(o => o.id === current.value)!)
const menu = ref<InstanceType<typeof Menu> | null>(null)
onMounted(() => { if (menu.value) menu.value.open = true })
</script>

<template>
  <div class="h-80 w-sidebar">
    <div class="h-bar">
      <Menu
        ref="menu"
        label="workspaces"
        offset="8px"
        class="!flex h-full w-full"
        trigger-class="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
      >
        <template #trigger>
          <span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{{ org.name.charAt(0) }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-meta leading-3 font-medium">{{ org.name }}</span>
            <span class="mt-0.5 block truncate text-caption leading-3 text-fg-muted">Acme · admin</span>
          </span>
          <ChevronsUpDown :size="14" :stroke-width="1.5" class="mr-0.75 shrink-0 text-fg-muted" aria-hidden="true" />
        </template>
        <MenuLabel><span class="truncate">Acme</span><span class="shrink-0 border border-edge px-1 text-caption leading-4">admin</span></MenuLabel>
        <MenuItem v-for="o in organizations" :key="o.id" :current="o.id === current" @select="current = o.id">
          <span class="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{{ o.name.charAt(0) }}</span>
          <span class="min-w-0 flex-1 truncate">{{ o.name }}</span>
          <span v-if="o.default" class="type-meta text-fg-muted">default</span>
          <Check v-if="o.id === current" :size="14" :stroke-width="1.5" class="shrink-0" aria-label="current" />
        </MenuItem>
        <MenuSeparator />
        <MenuItem><Plus :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />New organization</MenuItem>
        <MenuItem><Settings :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Organization settings</MenuItem>
        <MenuItem><Users :size="14" :stroke-width="1.5" class="shrink-0 text-fg-muted" aria-hidden="true" />Invite members</MenuItem>
      </Menu>
    </div>
  </div>
</template>
