<script setup lang="ts">
import { ref, type Component } from 'vue'
import { Menu as MenuIcon, X } from 'lucide-vue-next'
import Breadcrumb, { type Crumb } from '@/components/ui/Breadcrumb.vue'
import Sidebar from '@/components/ui/Sidebar.vue'
import SidebarLabel from '@/components/ui/SidebarLabel.vue'
import SidebarLink from '@/components/ui/SidebarLink.vue'
import TopBar from '@/components/ui/TopBar.vue'

// The console's layout (layouts/console.vue) for page compositions: the Sidebar at the left, sticky at the screen's
// height, the TopBar with the trail over the page. Below 768px the sidebar is a drawer: the bar's menu button slides
// it in over a dimmed page (240ms in, 180ms out, on the strong ease-out), a tap on the page or Escape closes it.
// `head` takes the workspace switcher, `foot` the account menu, `bar` what sits at the bar's end.
export interface FrameLink { label: string, icon?: Component, href?: string, status?: string, alert?: boolean, active?: boolean }
export interface FrameGroup { label: string, links: FrameLink[] }
defineProps<{ groups: FrameGroup[], crumbs: Crumb[] }>()
const emit = defineEmits<{ navigate: [link: FrameLink] }>()
const open = ref(false)
function go(link: FrameLink, event: MouseEvent) {
  event.preventDefault()
  open.value = false
  emit('navigate', link)
}
</script>

<template>
  <div class="flex min-h-screen bg-surface" @keydown.escape="open = false">
    <Sidebar label="console" class="ds-frame-side shrink-0" :data-open="open || undefined">
      <template v-if="$slots.head" #head><slot name="head" /></template>
      <template v-for="group in groups" :key="group.label">
        <SidebarLabel>{{ group.label }}</SidebarLabel>
        <SidebarLink v-for="link in group.links" :key="link.label" :href="link.href ?? '#'" :icon="link.icon" :status="link.status" :alert="link.alert" :active="link.active" @click="go(link, $event)">{{ link.label }}</SidebarLink>
      </template>
      <template v-if="$slots.foot" #foot><slot name="foot" /></template>
    </Sidebar>
    <div v-if="open" class="fixed inset-0 z-20 bg-scrim-light md:hidden" aria-hidden="true" @click="open = false" />
    <div class="flex min-w-0 flex-1 flex-col">
      <TopBar>
        <template #start>
          <button type="button" class="-ml-2 inline-flex size-control-touch shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge hover:text-fg md:hidden" :aria-expanded="open" :aria-label="open ? 'close menu' : 'open menu'" @click="open = !open">
            <X v-if="open" :size="14" :stroke-width="1.5" />
            <MenuIcon v-else :size="14" :stroke-width="1.5" />
          </button>
        </template>
        <Breadcrumb :items="crumbs" @navigate="(_, e) => e.preventDefault()" />
        <template #end><slot name="bar" /></template>
      </TopBar>
      <main class="min-w-0 flex-1"><slot /></main>
    </div>
  </div>
</template>

<style>
@media (min-width: 768px) { .ds-frame-side { position: sticky; top: 0; height: 100vh; } }
@media (max-width: 767px) {
  .ds-frame-side { position: fixed; top: 0; bottom: 0; left: 0; z-index: 30; width: min(300px, 84vw); overscroll-behavior: contain; visibility: hidden; transform: translateX(-100%); transition: transform var(--ds-duration-slide) var(--ds-easing-out), visibility 0s linear var(--ds-duration-slide); }
  .ds-frame-side[data-open] { visibility: visible; transform: none; transition: transform var(--ds-duration-drawer) var(--ds-easing-out); }
}
@media (prefers-reduced-motion: reduce) { .ds-frame-side, .ds-frame-side[data-open] { transition: none; } }
</style>
