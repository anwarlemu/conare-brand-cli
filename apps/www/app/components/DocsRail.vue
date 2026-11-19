<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BookOpen, Boxes, Frame, Image, Menu as MenuIcon, Palette, PenTool, Search, X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Sidebar from '@/components/ui/Sidebar.vue'
import SidebarLabel from '@/components/ui/SidebarLabel.vue'
import SidebarLink from '@/components/ui/SidebarLink.vue'
import { grouped, findItem } from '~/utils/registry'

// One rail on every page, in the console's own look (the library's Sidebar): the mark and the name, a filter, the
// site's pages, then every group A to Z with its items A to Z. On a phone it opens over the page from the top bar.
const route = useRoute()
const NuxtLink = resolveComponent('NuxtLink')
const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })
const filter = ref('')
const pages = [
  { to: '/', label: 'Introduction', icon: BookOpen },
  { to: '/components', label: 'All components', icon: Boxes },
  { to: '/theme', label: 'Theme', icon: Palette },
  { to: '/assets', label: 'Assets', icon: Image },
  { to: '/illustrations', label: 'Illustrations', icon: PenTool },
  { to: '/figma', label: 'Figma', icon: Frame },
]
const groups = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return grouped().map(g => ({ ...g, items: g.items.filter(i => !q || i.title.toLowerCase().includes(q) || i.name.includes(q)) })).filter(g => g.items.length)
})
const current = computed(() => pages.find(p => p.to === route.path)?.label ?? findItem(String(route.params.name ?? ''))?.title ?? 'Design system')
</script>

<template>
  <header class="sticky top-0 z-30 flex h-bar items-center gap-2 border-b border-edge bg-surface px-4 md:hidden">
    <Button variant="ghost" icon class="-ml-2" :aria-expanded="open" aria-controls="docs-rail" :aria-label="open ? 'close menu' : 'open menu'" @click="open = !open">
      <X v-if="open" :size="14" :stroke-width="1.5" />
      <MenuIcon v-else :size="14" :stroke-width="1.5" />
    </Button>
    <span class="min-w-0 flex-1 truncate type-ui">{{ current }}</span>
  </header>
  <div v-if="open" class="fixed inset-0 z-20 bg-[var(--ds-color-scrim)] md:hidden" aria-hidden="true" @click="open = false" />
  <Sidebar
    id="docs-rail"
    label="design system"
    class="!w-rail shrink-0 md:sticky md:top-0 md:h-dvh"
    :class="open ? 'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30' : 'max-md:!hidden'"
  >
    <template #head>
      <NuxtLink to="/" class="flex h-full items-center gap-2 px-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus">
        <img src="/conare-ds/logo/svg/mark.svg" alt="" height="20" width="22" class="h-5 w-auto shrink-0">
        <span class="min-w-0 flex-1">
          <span class="block text-meta leading-3 font-medium">Conare</span>
          <span class="mt-0.5 block text-caption leading-3 text-fg-muted">Design system</span>
        </span>
      </NuxtLink>
    </template>
    <div class="mx-3 mt-3 mb-1">
      <Input v-model="filter" :icon="Search" placeholder="Filter components" aria-label="filter components" />
    </div>
    <div class="pt-2">
      <SidebarLink v-for="p in pages" :key="p.to" :as="NuxtLink" :to="p.to" :icon="p.icon" :active="route.path === p.to">{{ p.label }}</SidebarLink>
    </div>
    <template v-for="g in groups" :key="g.id">
      <SidebarLabel><span class="flex items-center">{{ g.label }}<span class="ml-auto text-caption tabular-nums">{{ g.items.length }}</span></span></SidebarLabel>
      <SidebarLink v-for="i in g.items" :key="i.name" :as="NuxtLink" :to="`/components/${i.name}`" :active="route.path === `/components/${i.name}`">{{ i.title }}</SidebarLink>
    </template>
    <p v-if="!groups.length" class="px-4 py-2 type-meta text-fg-muted">Nothing matches "{{ filter }}".</p>
  </Sidebar>
</template>
