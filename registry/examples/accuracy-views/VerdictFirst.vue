<script setup lang="ts">
import AccuracyPanel from '@/components/product/AccuracyPanel.vue'
import ConsoleFrame from '@/components/product/ConsoleFrame.vue'
import ConsolePage from '@/components/product/ConsolePage.vue'
import { ASKED, consoleGroups, useSampleTest } from '@/examples/accuracy-views/sample'
// Accuracy views, Verdict first: one count and a field of a hundred squares, then what to look at.
// Sample data; wire the events to your own test.
const { view, run, add, remove } = useSampleTest()
</script>

<template>
  <ConsoleFrame :groups="consoleGroups('Performance')" :crumbs="[{ label: 'Overview', href: '#' }, { label: 'Performance' }]">
    <ConsolePage title="Performance">
      <AccuracyPanel :view="view" :version="1" link="https://console.acme.com/performance?view=accuracy" :asked="ASKED" @run="run" @add="add" @remove="remove" />
    </ConsolePage>
  </ConsoleFrame>
</template>
