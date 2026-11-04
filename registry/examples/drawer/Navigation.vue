<script setup lang="ts">
import { ref } from 'vue'
import { Activity, House, KeyRound, Layers, Menu as MenuIcon, Network, Settings } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
import SidebarLabel from '@/components/ui/SidebarLabel.vue'
import SidebarLink from '@/components/ui/SidebarLink.vue'
// The console's navigation on a phone: the bar's menu button slides the sidebar in from the left over the dimmed page.
// Pick a page, tap the page or press Escape to close it.
const open = ref(false)
const picked = ref('Namespaces')
const groups = [
  { label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Namespaces', icon: Layers, status: '11' }, { label: 'Sources', icon: Network, status: '1 failed', alert: true }] },
  { label: 'Manage', links: [{ label: 'API keys', icon: KeyRound, status: '4' }, { label: 'Usage', icon: Activity }, { label: 'Settings', icon: Settings }] },
]
function go(label: string) {
  picked.value = label
  open.value = false
}
</script>

<template>
  <div class="flex min-h-40 items-center justify-center">
    <Button icon aria-label="open menu" :aria-expanded="open" @click="open = true"><MenuIcon :size="14" :stroke-width="1.5" /></Button>
    <Drawer v-model:open="open" title="console">
      <nav class="flex flex-col pb-4" aria-label="console">
        <template v-for="group in groups" :key="group.label">
          <SidebarLabel>{{ group.label }}</SidebarLabel>
          <SidebarLink v-for="link in group.links" :key="link.label" href="#" :icon="link.icon" :status="link.status" :alert="link.alert" :active="picked === link.label" @click.prevent="go(link.label)">{{ link.label }}</SidebarLink>
        </template>
      </nav>
    </Drawer>
  </div>
</template>
