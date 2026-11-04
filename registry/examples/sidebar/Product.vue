<script setup lang="ts">
import { ref } from 'vue'
import { Activity, Atom, CreditCard, Gauge, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-vue-next'
import Sidebar from '@/components/ui/Sidebar.vue'
import SidebarLabel from '@/components/ui/SidebarLabel.vue'
import SidebarLink from '@/components/ui/SidebarLink.vue'
// The console's navigation: a label over each group, a row with its icon and count, a red edge on the page you are on,
// and the count turning red when something failed.
const groups = [
  { label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Namespaces', icon: Layers, status: '11' }, { label: 'Sources', icon: Network, status: '1 failed', alert: true }, { label: 'Agents', icon: SquareTerminal }, { label: 'Custom models', icon: Atom }] },
  { label: 'Manage', links: [{ label: 'API keys', icon: KeyRound, status: '4' }, { label: 'Performance', icon: Gauge }, { label: 'Usage', icon: Activity }, { label: 'Billing', icon: CreditCard }, { label: 'Settings', icon: Settings }] },
]
const picked = ref('Namespaces')
</script>

<template>
  <Sidebar label="console" class="border border-edge">
    <template v-for="group in groups" :key="group.label">
      <SidebarLabel>{{ group.label }}</SidebarLabel>
      <SidebarLink v-for="link in group.links" :key="link.label" href="#" :icon="link.icon" :status="link.status" :alert="link.alert" :active="picked === link.label" @click.prevent="picked = link.label">{{ link.label }}</SidebarLink>
    </template>
  </Sidebar>
</template>
