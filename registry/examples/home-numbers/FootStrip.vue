<script setup lang="ts">
import { Compass, House, Layers, Network } from 'lucide-vue-next'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import HomeNumbers from '@/components/product/HomeNumbers.vue'
import SearchBox from '@/components/product/SearchBox.vue'
import HighlightText from '@/components/visuals/HighlightText.vue'
// Explorer's first screen with its numbers, take 1: a strip along the board's foot, fixed to the bottom of the window beside the sidebar.
const groups = [{ label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Explorer', icon: Compass, active: true }, { label: 'Namespaces', icon: Layers, status: '6' }, { label: 'Sources', icon: Network }] }]
const days = Array.from({ length: 30 }, (_, i) => 3200 + ((i * 37) % 13) * 260 + (i % 7 > 4 ? -1800 : 0) + i * 30)
</script>

<template>
  <ConsoleFrame :groups="groups" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Explorer' }]">
    <div class="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-page flex-col justify-center gap-6 px-4 pt-8 pb-28 md:px-8">
      <HighlightText as="h1" text="Explore your data" accent="." class="text-center type-heading-1 md:type-hero" />
      <SearchBox />
      <HomeNumbers take="strip" :documents="2786122" :namespaces="6" :queries="148920" :typical="182" :slowest="296" :days="days" @navigate="(_, e) => e.preventDefault()" />
    </div>
  </ConsoleFrame>
</template>
