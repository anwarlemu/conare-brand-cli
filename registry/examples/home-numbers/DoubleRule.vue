<script setup lang="ts">
import { Compass, House, Layers, Network } from 'lucide-vue-next'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import HomeNumbers from '@/components/product/HomeNumbers.vue'
// Explorer's first screen with its numbers, take 2: the website's double rule under the box, this month's queries as bars, today's in red.
const groups = [{ label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Explorer', icon: Compass, active: true }, { label: 'Namespaces', icon: Layers, status: '6' }, { label: 'Sources', icon: Network }] }]
const days = Array.from({ length: 30 }, (_, i) => 3200 + ((i * 37) % 13) * 260 + (i % 7 > 4 ? -1800 : 0) + i * 30)
</script>

<template>
  <ConsoleFrame :groups="groups" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Explorer' }]">
    <div class="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-page flex-col justify-center gap-6 px-4 pt-8 pb-28 md:px-8">
      <h1 class="text-center type-heading-1 md:type-hero">Explore your data<span class="text-edge-accent">.</span></h1>
      <label class="block border border-edge-strong bg-surface p-3 transition-[border-color] duration-120 ease-standard focus-within:border-edge-focus">
        <span class="sr-only">question</span>
        <textarea rows="2" class="block w-full resize-none bg-transparent text-ui outline-none placeholder:text-fg-muted max-md:text-input" placeholder="Ask a question your documents answer" />
      </label>
      <HomeNumbers take="rule" :documents="2786122" :namespaces="6" :queries="148920" :typical="182" :slowest="296" :days="days" @navigate="(_, e) => e.preventDefault()" />
    </div>
  </ConsoleFrame>
</template>
